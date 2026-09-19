import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import runHandler from './api/rh/run.js';
import queryHandler from './api/rh/query.js';
import uploadHandler from './api/rh/upload.js';
import archiveHandler from './api/rh/archive.js';

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT || 3000);
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

function nodeHeadersToWeb(headers) {
  const out = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value == null) continue;
    if (key.toLowerCase() === 'host') continue;
    if (Array.isArray(value)) {
      for (const item of value) out.append(key, item);
    } else {
      out.set(key, String(value));
    }
  }
  return out;
}

function requestUrl(req) {
  const host = req.headers.host || `localhost:${PORT}`;
  return `http://${host}${req.url || '/'}`;
}

function toWebRequest(req) {
  const method = String(req.method || 'GET').toUpperCase();
  const init = {
    method,
    headers: nodeHeadersToWeb(req.headers)
  };
  if (!['GET', 'HEAD'].includes(method)) {
    init.body = Readable.toWeb(req);
    init.duplex = 'half';
  }
  return new Request(requestUrl(req), init);
}

async function sendWebResponse(res, response) {
  res.statusCode = response.status;
  res.statusMessage = response.statusText || res.statusMessage;

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'transfer-encoding') return;
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  Readable.fromWeb(response.body).pipe(res);
}

function json(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function safeStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.replace(/^[/\\\\]+/, '');
  return resolve(ROOT, relative);
}

function serveStatic(req, res, pathname) {
  let target = pathname;
  if (target === '/') target = '/index.html';
  if (target === '/history') target = '/history.html';

  const filePath = safeStaticPath(target);

  if (!(filePath === ROOT || filePath.startsWith(ROOT + sep))) {
    json(res, { error: 'Forbidden' }, 403);
    return true;
  }

  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) return false;

    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    const isHtml = type.startsWith('text/html');

    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Cache-Control': isHtml ? 'no-cache' : 'public, max-age=3600'
    });

    if (req.method === 'HEAD') {
      res.end();
      return true;
    }

    createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

function proxyHeaders(req, extra = {}) {
  const headers = nodeHeadersToWeb(req.headers);
  headers.delete('host');
  headers.set('accept-encoding', 'identity');
  headers.delete('connection');
  headers.delete('content-length');
  for (const [key, value] of Object.entries(extra)) headers.set(key, value);
  return headers;
}

async function proxyRequest(req, res, upstreamUrl, extraHeaders = {}) {
  const method = String(req.method || 'GET').toUpperCase();
  const init = {
    method,
    headers: proxyHeaders(req, extraHeaders),
    redirect: 'manual'
  };

  if (!['GET', 'HEAD'].includes(method)) {
    init.body = Readable.toWeb(req);
    init.duplex = 'half';
  }

  const upstream = await fetch(upstreamUrl, init);
  await sendWebResponse(res, upstream);
}

async function route(req, res) {
  const url = new URL(req.url || '/', requestUrl(req));
  const pathname = url.pathname;

  if (pathname === '/healthz') {
    json(res, {
      ok: true,
      service: 'rh-studio',
      runtime: 'node',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (pathname === '/api/rh/run') {
    await sendWebResponse(res, await runHandler.fetch(toWebRequest(req)));
    return;
  }

  if (pathname === '/api/rh/query') {
    await sendWebResponse(res, await queryHandler.fetch(toWebRequest(req)));
    return;
  }

  if (pathname === '/api/rh/upload') {
    await sendWebResponse(res, await uploadHandler.fetch(toWebRequest(req)));
    return;
  }

  if (pathname === '/api/rh/archive') {
    await sendWebResponse(res, await archiveHandler.fetch(toWebRequest(req)));
    return;
  }

  if (pathname === '/rh-upload') {
    const auth = req.headers.authorization || '';
    await proxyRequest(
      req,
      res,
      'https://www.runninghub.ai/openapi/v2/media/upload/binary',
      auth ? { Authorization: String(auth) } : {}
    );
    return;
  }

  if (pathname.startsWith('/rh-media/')) {
    const suffix = pathname.slice('/rh-media/'.length);
    const upstream = new URL(
      suffix + url.search,
      'https://rh-images-1252422369.cos.ap-beijing.myqcloud.com/'
    );
    await proxyRequest(req, res, upstream.toString());
    return;
  }

  if (pathname.startsWith('/rh-media-hk/')) {
    const suffix = pathname.slice('/rh-media-hk/'.length);
    const upstream = new URL(
      suffix + url.search,
      'https://rh-hk-images-1252422369.cos.ap-hongkong.myqcloud.com/'
    );
    await proxyRequest(req, res, upstream.toString());
    return;
  }

  if (['GET', 'HEAD'].includes(String(req.method || '').toUpperCase()) && serveStatic(req, res, pathname)) {
    return;
  }

  json(res, { error: 'Not Found' }, 404);
}

const server = http.createServer((req, res) => {
  route(req, res).catch(error => {
    console.error('[SERVER_ERROR]', error);
    if (!res.headersSent) {
      json(res, { error: 'Internal Server Error' }, 500);
    } else {
      res.end();
    }
  });
});

server.requestTimeout = 120_000;
server.headersTimeout = 125_000;
server.keepAliveTimeout = 65_000;

server.listen(PORT, HOST, () => {
  console.log(`RH Studio listening on http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  console.log(`[SHUTDOWN] ${signal}`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
