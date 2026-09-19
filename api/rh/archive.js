const encoder = new TextEncoder();

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32Update(crc, bytes) {
  let c = crc >>> 0;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return c >>> 0;
}

function le16(value) {
  const out = new Uint8Array(2);
  new DataView(out.buffer).setUint16(0, value >>> 0, true);
  return out;
}

function le32(value) {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value >>> 0, true);
  return out;
}

function concat(...parts) {
  const length = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}

function dosDateTime(value = new Date()) {
  const year = Math.max(1980, value.getFullYear());
  const time = ((value.getHours() & 31) << 11) |
    ((value.getMinutes() & 63) << 5) |
    ((Math.floor(value.getSeconds() / 2)) & 31);
  const date = (((year - 1980) & 127) << 9) |
    (((value.getMonth() + 1) & 15) << 5) |
    (value.getDate() & 31);
  return {time, date};
}

function safeFilename(value, index) {
  let name = String(value || '').trim()
    .replace(/[\\/]+/g, '_')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[:*?"<>|]/g, '_');
  if (!name) name = 'rh-studio-' + String(index + 1).padStart(3, '0') + '.bin';
  if (name.length > 160) {
    const dot = name.lastIndexOf('.');
    const ext = dot > 0 ? name.slice(dot).slice(0, 16) : '';
    name = name.slice(0, 140 - ext.length) + ext;
  }
  return name;
}

function safeArchiveName(value) {
  const base = String(value || 'rh-studio-download.zip')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const named = base || 'rh-studio-download.zip';
  return named.toLowerCase().endsWith('.zip') ? named : named + '.zip';
}

function allowedResultUrl(value) {
  try {
    const url = new URL(String(value || ''));
    if (url.protocol !== 'https:') return null;
    const allowed = new Set([
      'rh-images-1252422369.cos.ap-beijing.myqcloud.com',
      'rh-hk-images-1252422369.cos.ap-hongkong.myqcloud.com'
    ]);
    return allowed.has(url.hostname) ? url : null;
  } catch {
    return null;
  }
}

function localHeader(nameBytes, time, date) {
  return concat(
    le32(0x04034b50),
    le16(20),
    le16(0x0808),
    le16(0),
    le16(time),
    le16(date),
    le32(0),
    le32(0),
    le32(0),
    le16(nameBytes.byteLength),
    le16(0),
    nameBytes
  );
}

function dataDescriptor(crc, size) {
  return concat(
    le32(0x08074b50),
    le32(crc),
    le32(size),
    le32(size)
  );
}

function centralHeader(entry) {
  return concat(
    le32(0x02014b50),
    le16(20),
    le16(20),
    le16(0x0808),
    le16(0),
    le16(entry.time),
    le16(entry.date),
    le32(entry.crc),
    le32(entry.size),
    le32(entry.size),
    le16(entry.nameBytes.byteLength),
    le16(0),
    le16(0),
    le16(0),
    le16(0),
    le32(0),
    le32(entry.localOffset),
    entry.nameBytes
  );
}

function endOfCentralDirectory(count, size, offset) {
  return concat(
    le32(0x06054b50),
    le16(0),
    le16(0),
    le16(count),
    le16(count),
    le32(size),
    le32(offset),
    le16(0)
  );
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return Response.json({error:'Method Not Allowed'}, {status:405});
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({error:'无效请求数据'}, {status:400});
    }

    const rawItems = Array.isArray(body?.items) ? body.items.slice(0, 50) : [];
    if (!rawItems.length) {
      return Response.json({error:'没有可打包的文件'}, {status:400});
    }

    const archiveName = safeArchiveName(body?.archiveName);
    const items = rawItems.map((item, index) => ({
      url:allowedResultUrl(item?.url),
      filename:safeFilename(item?.filename, index),
      taskId:String(item?.taskId || '')
    }));

    const stream = new ReadableStream({
      async start(controller) {
        let offset = 0;
        const central = [];
        const errors = [];
        const usedNames = new Map();

        const push = bytes => {
          if (offset + bytes.byteLength > 0xffffffff) {
            throw new Error('ZIP 文件超过 4GB，当前打包格式不支持');
          }
          controller.enqueue(bytes);
          offset += bytes.byteLength;
        };

        const uniqueName = raw => {
          const seen = usedNames.get(raw) || 0;
          usedNames.set(raw, seen + 1);
          if (!seen) return raw;
          const dot = raw.lastIndexOf('.');
          return dot > 0
            ? raw.slice(0, dot) + '-' + (seen + 1) + raw.slice(dot)
            : raw + '-' + (seen + 1);
        };

        const addBytesEntry = (rawName, bytes) => {
          const name = uniqueName(rawName);
          const nameBytes = encoder.encode(name);
          const {time, date} = dosDateTime();
          const localOffset = offset;
          push(localHeader(nameBytes, time, date));

          let crc = 0xffffffff;
          crc = crc32Update(crc, bytes);
          const finalCrc = (crc ^ 0xffffffff) >>> 0;
          push(bytes);
          push(dataDescriptor(finalCrc, bytes.byteLength));

          central.push({
            nameBytes,
            time,
            date,
            crc:finalCrc,
            size:bytes.byteLength,
            localOffset
          });
        };

        try {
          for (let index = 0; index < items.length; index++) {
            const item = items[index];
            if (!item.url) {
              errors.push((item.taskId ? 'Task ' + item.taskId + ': ' : '') + '结果地址不受支持');
              continue;
            }

            let response;
            try {
              response = await fetch(item.url, {
                method:'GET',
                redirect:'error',
                headers:{'Accept':'*/*'}
              });
            } catch (error) {
              errors.push((item.taskId ? 'Task ' + item.taskId + ': ' : '') + (error?.message || '文件请求失败'));
              continue;
            }

            if (!response.ok || !response.body) {
              errors.push((item.taskId ? 'Task ' + item.taskId + ': ' : '') + '文件请求失败 (' + response.status + ')');
              continue;
            }

            const name = uniqueName(item.filename);
            const nameBytes = encoder.encode(name);
            const {time, date} = dosDateTime();
            const localOffset = offset;
            push(localHeader(nameBytes, time, date));

            let crc = 0xffffffff;
            let size = 0;
            const reader = response.body.getReader();

            try {
              while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
                size += bytes.byteLength;
                if (size > 0xffffffff) throw new Error('单个文件超过 4GB');
                crc = crc32Update(crc, bytes);
                push(bytes);
              }
            } catch (error) {
              errors.push((item.taskId ? 'Task ' + item.taskId + ': ' : '') + (error?.message || '读取文件失败'));
              throw error;
            }

            const finalCrc = (crc ^ 0xffffffff) >>> 0;
            push(dataDescriptor(finalCrc, size));
            central.push({nameBytes,time,date,crc:finalCrc,size,localOffset});
          }

          if (errors.length) {
            addBytesEntry('_errors.txt', encoder.encode(
              'RH Studio 打包时以下文件未能获取：\n\n' + errors.join('\n')
            ));
          }

          if (!central.length) {
            addBytesEntry('_errors.txt', encoder.encode('没有可下载的有效生成结果。'));
          }

          const centralOffset = offset;
          for (const entry of central) push(centralHeader(entry));
          const centralSize = offset - centralOffset;
          push(endOfCentralDirectory(central.length, centralSize, centralOffset));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      status:200,
      headers:{
        'Content-Type':'application/zip',
        'Content-Disposition':'attachment; filename="' + archiveName + '"',
        'Cache-Control':'no-store'
      }
    });
  }
};
