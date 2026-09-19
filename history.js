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
  } catch {}
  return url;
}

function isImageType(value) {
  const type = String(value || '').toLowerCase();
  return ['png','jpg','jpeg','webp','gif','avif'].includes(type) || type.includes('image');
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

function renderHistory() {
  const list = $('#historyList');
  const items = getHistory().sort((a,b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  $('#historyCount').textContent = String(items.length);

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
    const appName = esc(item.appName || 'RunningHub');
    const appParam = item.appKey ? '&app=' + encodeURIComponent(item.appKey) : '';

    const media = success
      ? '<div class="history-media" style="aspect-ratio:' + ratioValue(item.aspect) + '">' +
          (isImageType(type)
            ? '<img src="' + esc(mediaUrl) + '" alt="generated image">'
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
            '<i class="history-status ' + esc(status.toLowerCase()) + '">' + esc(statusText(status)) + '</i>' +
          '</div>' +
          '<h3>' + title + '</h3>' +
          '<div class="history-meta">' +
            '<span>' + ratio + '</span>' +
            '<span>' + quality + '</span>' +
            '<span>' + duration + '</span>' +
            '<span>' + instance + '</span>' +
          '</div>' +
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

$('#importHistoryTask').onclick = importTask;

$('#historyList').addEventListener('error', e => {
  if (!['VIDEO','IMG'].includes(e.target.tagName)) return;
  const media = e.target.closest('.history-media');
  if (!media) return;
  media.classList.add('history-media-broken');
}, true);

renderHistory();
refreshActiveTasks();
