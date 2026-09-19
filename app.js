const $ = s => document.querySelector(s);

const LS = {
  key: 'rhstudio.apiKey',
  app: 'rhstudio.appId',
  oldNodes: 'rhstudio.nodes',
  inst: 'rhstudio.instanceType',
  queue: 'rhstudio.personalQueue',
  prompt: 'rhstudio.prompt',
  promptNode: 'rhstudio.promptNodeId',
  promptField: 'rhstudio.promptFieldName',
  refNode: 'rhstudio.referenceNodeId',
  refField: 'rhstudio.referenceFieldName'
};

const state = {
  referenceFile: null,
  task: null,
  poll: null,
  running: false
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[c]));

function toast(message, type = '') {
  const el = $('#toast');
  el.textContent = message;
  el.className = 'toast show ' + type;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.className = 'toast', 2600);
}

function apiKey() {
  return localStorage.getItem(LS.key) || '';
}

function maskKey(key) {
  if (!key) return '';
  if (key.length < 10) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

function updateKeyUI() {
  const key = apiKey();
  const ok = !!key;
  $('#sideDot').className = 'dot ' + (ok ? 'ok' : '');
  $('#sideStatus').textContent = ok ? 'API Key 已配置' : 'API Key 未配置';
  $('#settingsDot').className = 'dot ' + (ok ? 'ok' : '');
  $('#keyStatusText').textContent = ok ? '已保存 API Key' : '尚未保存 API Key';
  $('#keyMask').textContent = ok ? maskKey(key) : '';
  $('#settingsBadge').textContent = ok ? 'CONFIGURED' : 'NOT CONFIGURED';
  $('#settingsBadge').style.color = ok ? 'var(--good)' : 'var(--accent)';
}

function migrateLegacyConfig() {
  let rows = [];
  try {
    const parsed = JSON.parse(localStorage.getItem(LS.oldNodes) || '[]');
    if (Array.isArray(parsed)) rows = parsed;
  } catch {}

  if (!localStorage.getItem(LS.promptNode)) {
    const promptRow = rows.find(r => r && r.kind !== 'file' && String(r.nodeId || '').trim() && String(r.fieldName || '').trim());
    if (promptRow) {
      localStorage.setItem(LS.promptNode, String(promptRow.nodeId).trim());
      localStorage.setItem(LS.promptField, String(promptRow.fieldName).trim());
      if (!localStorage.getItem(LS.prompt) && promptRow.fieldValue) {
        localStorage.setItem(LS.prompt, String(promptRow.fieldValue));
      }
    }
  }

  if (!localStorage.getItem(LS.refNode)) {
    const refRow = rows.find(r => r && r.kind === 'file' && String(r.nodeId || '').trim() && String(r.fieldName || '').trim());
    if (refRow) {
      localStorage.setItem(LS.refNode, String(refRow.nodeId).trim());
      localStorage.setItem(LS.refField, String(refRow.fieldName).trim());
    }
  }
}

function loadConfig() {
  migrateLegacyConfig();

  $('#appId').value = localStorage.getItem(LS.app) || '';
  $('#instanceType').value = localStorage.getItem(LS.inst) || 'default';
  $('#personalQueue').value = localStorage.getItem(LS.queue) || 'false';
  $('#promptInput').value = localStorage.getItem(LS.prompt) || '';
  $('#promptNodeId').value = localStorage.getItem(LS.promptNode) || '';
  $('#promptFieldName').value = localStorage.getItem(LS.promptField) || '';
  $('#referenceNodeId').value = localStorage.getItem(LS.refNode) || '';
  $('#referenceFieldName').value = localStorage.getItem(LS.refField) || '';

  updateMappingUI();
}

function saveConfig() {
  localStorage.setItem(LS.app, $('#appId').value.trim());
  localStorage.setItem(LS.inst, $('#instanceType').value);
  localStorage.setItem(LS.queue, $('#personalQueue').value);
  localStorage.setItem(LS.prompt, $('#promptInput').value);
  localStorage.setItem(LS.promptNode, $('#promptNodeId').value.trim());
  localStorage.setItem(LS.promptField, $('#promptFieldName').value.trim());
  localStorage.setItem(LS.refNode, $('#referenceNodeId').value.trim());
  localStorage.setItem(LS.refField, $('#referenceFieldName').value.trim());
  updateMappingUI();
}

function updateMappingUI() {
  const appReady = !!$('#appId').value.trim();
  const promptReady = !!$('#promptNodeId').value.trim() && !!$('#promptFieldName').value.trim();
  const el = $('#mappingState');

  if (appReady && promptReady) {
    el.className = 'mapping-state ok';
    el.querySelector('span').textContent = '工作流已配置';
  } else {
    el.className = 'mapping-state warn';
    el.querySelector('span').textContent = '需要在设置中完成工作流映射';
  }
}

function openSettings() {
  $('#settingsOverlay').classList.remove('hidden');
  $('#apiKeyInput').value = '';
  document.body.style.overflow = 'hidden';
}

function closeSettings() {
  $('#settingsOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

$('#openSettings').onclick = openSettings;
$('#closeSettings').onclick = closeSettings;
$('#settingsBackdrop').onclick = closeSettings;
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#settingsOverlay').classList.contains('hidden')) closeSettings();
});

[
  'appId',
  'instanceType',
  'personalQueue',
  'promptInput',
  'promptNodeId',
  'promptFieldName',
  'referenceNodeId',
  'referenceFieldName'
].forEach(id => {
  $('#' + id).addEventListener('input', saveConfig);
  $('#' + id).addEventListener('change', saveConfig);
});

$('#referenceBox').onclick = e => {
  if (e.target.closest('#clearReference')) return;
  $('#referenceInput').click();
};

$('#referenceInput').onchange = () => {
  const file = $('#referenceInput').files[0];
  if (!file) return;

  state.referenceFile = file;
  $('#referenceName').textContent = file.name;
  $('#referenceHint').textContent = formatBytes(file.size) + ' · 运行时上传到 RunningHub';
  $('#clearReference').classList.remove('hidden');
};

$('#clearReference').onclick = e => {
  e.stopPropagation();
  clearReference();
};

function clearReference() {
  state.referenceFile = null;
  $('#referenceInput').value = '';
  $('#referenceName').textContent = '添加参考图片 / 视频';
  $('#referenceHint').textContent = '点击选择本地文件';
  $('#clearReference').classList.add('hidden');
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return n.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

async function uploadReference(file, key) {
  const fd = new FormData();
  fd.append('file', file, file.name);

  const res = await fetch('/api/rh/upload', {
    method: 'POST',
    headers: { 'x-rh-key': key },
    body: fd
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ('文件上传失败 (' + res.status + ')'));

  const value =
    data?.data?.fileName ||
    data?.data?.download_url ||
    data?.fileName ||
    data?.download_url;

  if (!value) throw new Error('RunningHub 上传接口未返回可用文件值');
  return value;
}

function setStatus(status, meta) {
  const dot = $('#statusDot');
  dot.className = 'status-dot';

  if (status === 'RUNNING' || status === 'QUEUED') dot.classList.add('running');
  if (status === 'SUCCESS') dot.classList.add('success');
  if (status === 'FAILED') dot.classList.add('failed');

  const map = {
    IDLE: '等待生成',
    SUBMITTING: '正在提交',
    UPLOADING: '正在上传参考素材',
    QUEUED: '排队中',
    RUNNING: '生成中',
    SUCCESS: '生成完成',
    FAILED: '生成失败'
  };

  $('#statusText').textContent = map[status] || status || '等待生成';
  $('#taskMeta').textContent = meta || 'READY';
}

function renderIdle() {
  setStatus('IDLE', 'READY');
  $('#resultArea').innerHTML =
    '<div class="preview-empty">' +
      '<div class="play-orb">▶</div>' +
      '<strong>生成结果会显示在这里</strong>' +
      '<span>添加参考素材，输入提示词，然后开始生成。</span>' +
    '</div>';
}

function renderLoading(status, taskId) {
  setStatus(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  $('#resultArea').innerHTML =
    '<div class="preview-loading">' +
      '<div class="loader-orb"></div>' +
      '<strong>' + (status === 'QUEUED' ? '任务正在排队' : '视频正在生成') + '</strong>' +
      '<span>状态会每 3 秒自动刷新。</span>' +
    '</div>';
}

function isVideoResult(item) {
  const type = String(item?.outputType || '').toLowerCase();
  const url = String(item?.url || '').toLowerCase();
  return type.includes('video') || ['mp4', 'webm', 'mov', 'm4v'].includes(type) || /\.(mp4|webm|mov|m4v)(\?|$)/.test(url);
}

function isImageResult(item) {
  const type = String(item?.outputType || '').toLowerCase();
  const url = String(item?.url || '').toLowerCase();
  return type.includes('image') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'].includes(type) || /\.(png|jpe?g|webp|gif|avif)(\?|$)/.test(url);
}

function renderSuccess(task) {
  const results = Array.isArray(task?.results) ? task.results : [];
  const primary = results.find(isVideoResult) || results.find(isImageResult) || results[0];

  setStatus('SUCCESS', task?.taskId ? ('TASK · ' + task.taskId) : 'DONE');

  if (!primary) {
    $('#resultArea').innerHTML =
      '<div class="preview-empty">' +
        '<div class="play-orb">✓</div>' +
        '<strong>任务完成</strong>' +
        '<span>RunningHub 没有返回可预览的媒体结果。</span>' +
      '</div>';
    return;
  }

  const url = primary.url || '';
  const type = String(primary.outputType || 'output').toLowerCase();
  let media = '';

  if (isVideoResult(primary) && url) {
    media = '<video src="' + esc(url) + '" controls playsinline></video>';
  } else if (isImageResult(primary) && url) {
    media = '<img src="' + esc(url) + '" alt="generated output">';
  } else if (primary.text) {
    media =
      '<div class="preview-file">' +
        '<strong>' + esc(primary.text) + '</strong>' +
      '</div>';
  } else {
    media =
      '<div class="preview-file">' +
        '<strong>' + esc(type.toUpperCase()) + '</strong>' +
      '</div>';
  }

  let meta =
    '<div class="output-meta">' +
      '<span>' + esc(type || 'output') + (results.length > 1 ? (' · ' + results.length + ' 个输出') : '') + '</span>';

  if (url) {
    meta += '<a href="' + esc(url) + '" target="_blank" rel="noreferrer">打开原文件 ↗</a>';
  }

  meta += '</div>';

  $('#resultArea').innerHTML = media + meta;
}

function renderFailed(task) {
  setStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');

  let reason = task?.errorMessage || '';
  if (!reason && task?.failedReason) {
    try { reason = JSON.stringify(task.failedReason); } catch {}
  }

  $('#resultArea').innerHTML =
    '<div class="preview-error">' +
      '<div class="play-orb">!</div>' +
      '<strong>生成失败</strong>' +
      '<span>' + esc(reason || 'RunningHub 返回任务失败。') + '</span>' +
    '</div>';
}

async function runTask() {
  if (state.running) return;

  const key = apiKey();
  if (!key) {
    toast('请先在右上角设置中保存 API Key', 'bad');
    openSettings();
    return;
  }

  const appId = $('#appId').value.trim();
  const prompt = $('#promptInput').value.trim();
  const promptNode = $('#promptNodeId').value.trim();
  const promptField = $('#promptFieldName').value.trim();
  const refNode = $('#referenceNodeId').value.trim();
  const refField = $('#referenceFieldName').value.trim();

  if (!appId) {
    toast('请先在设置中填写 AI App ID', 'bad');
    openSettings();
    return;
  }

  if (!prompt) {
    toast('请输入视频提示词', 'bad');
    $('#promptInput').focus();
    return;
  }

  if (!promptNode || !promptField) {
    toast('请先在设置中配置提示词节点映射', 'bad');
    openSettings();
    return;
  }

  if (state.referenceFile && (!refNode || !refField)) {
    toast('已添加参考素材，请先配置参考素材节点映射', 'bad');
    openSettings();
    return;
  }

  state.running = true;
  $('#runBtn').disabled = true;
  $('#runBtn').textContent = '准备任务…';
  setStatus('SUBMITTING', 'PREPARING');

  try {
    const nodeInfoList = [{
      nodeId: promptNode,
      fieldName: promptField,
      fieldValue: prompt,
      description: null
    }];

    if (state.referenceFile) {
      setStatus('UPLOADING', 'REFERENCE');
      $('#runBtn').textContent = '上传素材…';
      const uploadedValue = await uploadReference(state.referenceFile, key);

      nodeInfoList.push({
        nodeId: refNode,
        fieldName: refField,
        fieldValue: String(uploadedValue),
        description: null
      });
    }

    $('#runBtn').textContent = '提交任务…';

    const res = await fetch('/api/rh/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rh-key': key
      },
      body: JSON.stringify({
        appId,
        nodeInfoList,
        instanceType: $('#instanceType').value,
        usePersonalQueue: $('#personalQueue').value
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || ('提交失败 (' + res.status + ')'));

    state.task = data;
    toast('生成任务已提交', 'good');

    const status = data.status || 'RUNNING';

    if (status === 'SUCCESS') {
      renderSuccess(data);
    } else if (status === 'FAILED') {
      renderFailed(data);
    } else {
      renderLoading(status, data.taskId);
      if (data.taskId) {
        clearInterval(state.poll);
        state.poll = setInterval(() => queryTask(data.taskId), 3000);
      }
    }
  } catch (error) {
    setStatus('FAILED', 'SUBMIT ERROR');
    $('#resultArea').innerHTML =
      '<div class="preview-error">' +
        '<div class="play-orb">!</div>' +
        '<strong>提交失败</strong>' +
        '<span>' + esc(error?.message || '运行失败') + '</span>' +
      '</div>';
    toast(error?.message || '运行失败', 'bad');
  } finally {
    state.running = false;
    $('#runBtn').disabled = false;
    $('#runBtn').innerHTML = '开始生成 <span>↗</span>';
  }
}

async function queryTask(taskId) {
  try {
    const res = await fetch('/api/rh/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rh-key': apiKey()
      },
      body: JSON.stringify({ taskId })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || ('查询失败 (' + res.status + ')'));

    state.task = data;
    const status = data.status || 'RUNNING';

    if (status === 'SUCCESS') {
      clearInterval(state.poll);
      state.poll = null;
      renderSuccess(data);
      toast('视频生成完成', 'good');
    } else if (status === 'FAILED') {
      clearInterval(state.poll);
      state.poll = null;
      renderFailed(data);
      toast('视频生成失败', 'bad');
    } else {
      renderLoading(status, data.taskId || taskId);
    }
  } catch (error) {
    clearInterval(state.poll);
    state.poll = null;
    setStatus('FAILED', 'QUERY ERROR');
    toast(error?.message || '任务查询失败', 'bad');
  }
}

$('#runBtn').onclick = runTask;

$('#toggleKey').onclick = () => {
  const input = $('#apiKeyInput');
  input.type = input.type === 'password' ? 'text' : 'password';
  $('#toggleKey').textContent = input.type === 'password' ? '显示' : '隐藏';
};

$('#saveKey').onclick = () => {
  const value = $('#apiKeyInput').value.trim();
  if (!value) return toast('请输入 API Key', 'bad');

  localStorage.setItem(LS.key, value);
  $('#apiKeyInput').value = '';
  updateKeyUI();
  toast('API Key 已保存到当前浏览器', 'good');
};

$('#clearKey').onclick = () => {
  localStorage.removeItem(LS.key);
  $('#apiKeyInput').value = '';
  updateKeyUI();
  toast('API Key 已清除');
};

$('#clearLocal').onclick = () => {
  [
    LS.app,
    LS.oldNodes,
    LS.inst,
    LS.queue,
    LS.prompt,
    LS.promptNode,
    LS.promptField,
    LS.refNode,
    LS.refField
  ].forEach(key => localStorage.removeItem(key));

  clearReference();
  loadConfig();
  renderIdle();
  toast('本地应用配置已清除');
};

loadConfig();
updateKeyUI();
renderIdle();
