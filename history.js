const $ = s => document.querySelector(s);

const LS = {
  key: 'rhstudio.apiKey',
  history: 'rhstudio.generationHistory'
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[c]));

function toast(message, type='') {
  const el = $('#toast');
  el.textContent = message;
  el.className = 'toast show ' + type;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.className = 'toast', 2300);
}

function apiKey() {
  return localStorage.getItem(LS.key) || '';
}

function getHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(LS.history) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(LS.history, JSON.stringify(items.slice(0, 50)));
}

function formatTime(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month:'2-digit',
      day:'2-digit',
      hour:'2-digit',
      minute:'2-digit'
    }).format(new Date(value));
  } catch {
    return '';
  }
}

function statusText(status) {
  return {
    SUCCESS:'已完成',
    FAILED:'失败',
    RUNNING:'生成中',
    QUEUED:'排队中'
  }[status] || status || '未知';
}

function toMediaUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, window.location.href);
    if (parsed.hostname === 'rh-images-1252422369.cos.ap-beijing.myqcloud.com') {
      return '/rh-media' + parsed.pathname + parsed.search;
    }
    if (parsed.hostname === 'rh-hk-images-1252422369.cos.ap-hongkong.myqcloud.com') {
      return '/rh-media-hk' + parsed.pathname + parsed.search;
    }
  } catch {}
  return url;
}

function historyImageTag(url) {
  const direct = String(url || '');
  const proxy = toMediaUrl(direct);
  return '<img src="' + esc(direct) + '"' +
    (proxy && proxy !== direct ? ' data-fallback-src="' + esc(proxy) + '"' : '') +
    ' referrerpolicy="no-referrer" alt="generated image">';
}

function isImageType(value) {
  const type = String(value || '').toLowerCase();
  return ['png','jpg','jpeg','webp','gif','avif'].includes(type) || type.includes('image');
}

function outputExtension(item) {
  const raw = String(item?.outputType || '').toLowerCase();
  const clean = raw.replace(/[^a-z0-9]/g, '');
  if (clean && clean.length <= 8) return clean;
  try {
    const path = new URL(item?.resultUrl || '').pathname;
    const match = path.match(/\.([a-z0-9]{2,8})$/i);
    if (match) return match[1].toLowerCase();
  } catch {}
  return isImageType(raw) ? 'png' : 'mp4';
}

function getLatestBatchId(items=getHistory()) {
  const latest = [...items]
    .filter(item => item?.batchId)
    .sort((a,b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))[0];
  return latest?.batchId || '';
}

function downloadableItems(items) {
  return items.filter(item =>
    String(item?.status || '').toUpperCase() === 'SUCCESS' &&
    !!item?.resultUrl
  );
}

function syncArchiveButtons(items=getHistory()) {
  const all = downloadableItems(items);
  const latestBatchId = getLatestBatchId(items);
  const latest = latestBatchId
    ? all.filter(item => item.batchId === latestBatchId)
    : [];

  const latestButton = $('#downloadLatestBatch');
  const allButton = $('#downloadAllHistory');
  const clearButton = $('#clearHistory');

  if (latestButton) {
    latestButton.disabled = latest.length === 0;
    latestButton.dataset.batchId = latestBatchId;
    latestButton.title = latestBatchId
      ? ('最近批次可下载 ' + latest.length + ' 个结果')
      : '暂无批量生成记录';
  }

  if (allButton) {
    allButton.disabled = all.length === 0;
    allButton.title = '全部可下载结果 ' + all.length + ' 个';
  }

  if (clearButton) {
    clearButton.disabled = items.length === 0;
    clearButton.title = items.length ? ('清空当前 ' + items.length + ' 条本地生成记录') : '暂无记录可清空';
  }
}

function ratioValue(value) {
  const match = String(value || '').match(/^(\d+):(\d+)$/);
  if (!match) return '16 / 9';
  const w = Math.max(1, Number(match[1]));
  const h = Math.max(1, Number(match[2]));
  return w + ' / ' + h;
}

function mergeTaskResult(taskId, data, fallback={}) {
  const items = getHistory();
  const prev = items.find(x => x.taskId === taskId) || {};
  const results = Array.isArray(data?.results) ? data.results : [];
  const primary =
    results.find(x => String(x?.outputType || '').toLowerCase().includes('mp4')) ||
    results.find(x => /video/i.test(String(x?.outputType || ''))) ||
    results[0] ||
    null;

  const next = {
    ...prev,
    ...fallback,
    taskId,
    status: data?.status || prev.status || 'RUNNING',
    createdAt: prev.createdAt || fallback.createdAt || Date.now(),
    updatedAt: Date.now(),
    resultUrl: primary?.url || prev.resultUrl || '',
    outputType: primary?.outputType || prev.outputType || '',
    errorCode: data?.errorCode || prev.errorCode || '',
    errorMessage: data?.errorMessage || prev.errorMessage || ''
  };

  saveHistory([next, ...items.filter(x => x.taskId !== taskId)]);
  return next;
}

async function queryTask(taskId) {
  const key = apiKey();
  if (!key) throw new Error('请先在工作台设置 RunningHub API Key');

  const res = await fetch('/api/rh/query', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'x-rh-key':key
    },
    body:JSON.stringify({taskId})
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ('查询失败 (' + res.status + ')'));
  return data;
}

function compareHistoryNewestFirst(a,b) {
  const createdDiff = Number(b?.createdAt || 0) - Number(a?.createdAt || 0);
  if (createdDiff) return createdDiff;

  const updatedDiff = Number(b?.updatedAt || 0) - Number(a?.updatedAt || 0);
  if (updatedDiff) return updatedDiff;

  return String(b?.taskId || '').localeCompare(String(a?.taskId || ''));
}

function renderHistory() {
  const list = $('#historyList');
  const items = [...getHistory()].sort(compareHistoryNewestFirst);
  $('#historyCount').textContent = String(items.length);
  syncArchiveButtons(items);

  if (!items.length) {
    list.innerHTML =
      '<div class="history-empty">' +
        '<strong>还没有生成记录</strong>' +
        '<span>从工作台生成的视频会自动出现在这里。</span>' +
      '</div>';
    return;
  }

  list.innerHTML = items.map(item => {
    const status = String(item.status || 'RUNNING').toUpperCase();
    const success = status === 'SUCCESS' && !!item.resultUrl;
    const mediaUrl = success ? toMediaUrl(item.resultUrl) : '';
    const type = String(item.outputType || 'mp4').replace(/[^a-z0-9]/gi,'').toLowerCase() || 'mp4';
    const title = item.prompt ? esc(item.prompt) : esc(item.appName || '生成任务');
    const ratio = esc(item.aspect || '—');
    const quality = esc(item.quality || '—');
    const duration = esc(item.duration || '—');
    const instance = esc(item.instance || '—');
    const taskId = esc(item.taskId || '');
    const time = esc(formatTime(item.createdAt));
    const appName = esc(item.appKey === 'image-2mp' ? '超强文生图V3.0 基础版' : (item.appName || 'RunningHub'));
    const appParam = item.appKey ? '&app=' + encodeURIComponent(item.appKey) : '';
    const batchTag = item.batchId
      ? '<div class="history-batch-tag">BATCH · ' +
          esc(String(item.batchIndex || '—')) + ' / ' +
          esc(String(item.batchTotal || '—')) +
        '</div>'
      : '';

    const media = success
      ? '<div class="history-media" style="aspect-ratio:' + ratioValue(item.aspect) + '">' +
          (isImageType(type)
            ? historyImageTag(item.resultUrl)
            : '<video src="' + esc(mediaUrl) + '" controls playsinline preload="metadata"></video>') +
        '</div>'
      : '<div class="history-media history-media-empty" style="aspect-ratio:' + ratioValue(item.aspect) + '">' +
          '<div class="history-media-state ' + esc(status.toLowerCase()) + '">' +
            (status === 'RUNNING' || status === 'QUEUED' ? '<i></i>' : '') +
            '<strong>' + esc(statusText(status)) + '</strong>' +
          '</div>' +
        '</div>';

    const download = success
      ? '<a class="history-download" href="' + esc(mediaUrl) + '" download="rh-studio-' + taskId + '.' + esc(type) + '">下载 <b>↓</b></a>'
      : '<button class="history-download disabled" type="button" disabled>暂无文件 <b>↓</b></button>';

    return (
      '<article class="history-card">' +
        media +
        '<div class="history-card-body">' +
          '<div class="history-card-head">' +
            '<span>' + time + ' · ' + appName + '</span>' +
            '<div class="history-card-head-actions">' +
              '<i class="history-status ' + esc(status.toLowerCase()) + '">' + esc(statusText(status)) + '</i>' +
              '<button class="history-delete" type="button" data-delete-task="' + taskId + '" aria-label="删除这条记录" title="删除这条本地记录">×</button>' +
            '</div>' +
          '</div>' +
          '<h3>' + title + '</h3>' +
          '<div class="history-meta">' +
            '<span>' + ratio + '</span>' +
            '<span>' + quality + '</span>' +
            '<span>' + duration + '</span>' +
            '<span>' + instance + '</span>' +
          '</div>' +
          batchTag +
          '<div class="history-task">TASK · ' + taskId + '</div>' +
          '<div class="history-card-actions">' +
            '<a class="history-open" href="/?task=' + encodeURIComponent(item.taskId || '') + appParam + '">查看</a>' +
            download +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }).join('');
}


function deleteHistoryItem(taskId) {
  const id = String(taskId || '').trim();
  if (!id) return;

  const items = getHistory();
  const next = items.filter(item => String(item?.taskId || '') !== id);
  if (next.length === items.length) return;

  saveHistory(next);
  renderHistory();
  toast('记录已从本地缓存删除');
}

function clearAllHistory() {
  const items = getHistory();
  if (!items.length) return;

  const ok = window.confirm('清空全部生成记录？\n\n只会删除当前浏览器里的记录缓存，不会删除 RunningHub 后台任务或已生成文件。');
  if (!ok) return;

  localStorage.removeItem(LS.history);
  renderHistory();
  toast('生成记录缓存已清空');
}

function archiveFilename(item, position, scope='all') {
  const ext = outputExtension(item);
  const index = scope === 'batch'
    ? Number(item.batchIndex || position + 1)
    : position + 1;
  const prefix = scope === 'batch' ? 'batch' : 'history';
  const safeIndex = String(index).padStart(3, '0');
  const task = String(item.taskId || 'task').replace(/[^a-zA-Z0-9_-]/g, '');
  return prefix + '-' + safeIndex + '-' + task + '.' + ext;
}

function setArchiveBusy(button, busy, label='') {
  if (!button) return;
  if (busy) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = (label || '正在打包') + ' <b>…</b>';
  } else {
    if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
    delete button.dataset.originalHtml;
    syncArchiveButtons();
  }
}

async function requestHistoryArchive(items, archiveName, scope, button) {
  const targets = downloadableItems(items);
  if (!targets.length) {
    toast('没有可打包下载的已完成结果','bad');
    return;
  }

  setArchiveBusy(button, true, '正在打包');

  try {
    const payload = targets.map((item, index) => ({
      url:item.resultUrl,
      taskId:item.taskId,
      filename:archiveFilename(item, index, scope)
    }));

    const res = await fetch('/api/rh/archive', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        archiveName,
        items:payload
      })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || ('打包失败 (' + res.status + ')'));
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = archiveName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);

    toast('ZIP 打包下载已开始','good');
  } catch (error) {
    toast(error?.message || '打包下载失败','bad');
  } finally {
    setArchiveBusy(button, false);
  }
}

async function downloadLatestBatchArchive() {
  const items = getHistory();
  const batchId = getLatestBatchId(items);
  if (!batchId) {
    toast('还没有批量生成记录','bad');
    return;
  }

  const batchItems = items
    .filter(item => item.batchId === batchId)
    .sort((a,b) => Number(a.batchIndex || 0) - Number(b.batchIndex || 0));

  const suffix = batchId.replace(/[^a-zA-Z0-9_-]/g, '').slice(-24) || 'latest';
  await requestHistoryArchive(
    batchItems,
    'rh-studio-latest-batch-' + suffix + '.zip',
    'batch',
    $('#downloadLatestBatch')
  );
}

async function downloadAllHistoryArchive() {
  const items = getHistory()
    .sort((a,b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));

  await requestHistoryArchive(
    items,
    'rh-studio-all-history.zip',
    'all',
    $('#downloadAllHistory')
  );
}

async function importTask() {
  const taskId = String(prompt('输入 RunningHub Task ID') || '').trim();
  if (!taskId) return;

  if (!/^\d{10,}$/.test(taskId)) {
    toast('Task ID 格式不正确', 'bad');
    return;
  }

  try {
    toast('正在查询任务…');
    const data = await queryTask(taskId);
    mergeTaskResult(taskId, data, {createdAt:Date.now()});
    renderHistory();
    toast('任务已导入', 'good');
  } catch (error) {
    toast(error?.message || '导入失败', 'bad');
  }
}

async function refreshActiveTasks() {
  if (!apiKey()) return;

  const items = getHistory();
  const targets = items
    .filter(item =>
      ['RUNNING','QUEUED'].includes(String(item.status || '').toUpperCase()) ||
      (String(item.status || '').toUpperCase() === 'SUCCESS' && !item.resultUrl)
    )
    .slice(0, 12);

  if (!targets.length) return;

  let changed = false;
  for (const item of targets) {
    try {
      const data = await queryTask(item.taskId);
      mergeTaskResult(item.taskId, data);
      changed = true;
    } catch {}
  }

  if (changed) renderHistory();
}

$('#downloadLatestBatch').onclick = downloadLatestBatchArchive;
$('#downloadAllHistory').onclick = downloadAllHistoryArchive;
$('#clearHistory').onclick = clearAllHistory;
$('#importHistoryTask').onclick = importTask;

$('#historyList').addEventListener('click', e => {
  const button = e.target.closest('[data-delete-task]');
  if (!button) return;
  e.preventDefault();
  e.stopPropagation();
  deleteHistoryItem(button.dataset.deleteTask);
});

$('#historyList').addEventListener('error', e => {
  if (!['VIDEO','IMG'].includes(e.target.tagName)) return;

  if (e.target.tagName === 'IMG' && e.target.dataset.fallbackSrc && !e.target.dataset.fallbackTried) {
    e.target.dataset.fallbackTried = '1';
    e.target.src = e.target.dataset.fallbackSrc;
    return;
  }

  const media = e.target.closest('.history-media');
  if (!media) return;
  media.classList.add('history-media-broken');
}, true);

renderHistory();
refreshActiveTasks();
