const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const APP_ID = '2084320751339032577';

const LS = {
  key: 'rhstudio.apiKey',
  app: 'rhstudio.appId',
  prompt: 'rhstudio.prompt',
  aspect: 'rhstudio.aspectRatio',
  inst: 'rhstudio.instanceType',
  queue: 'rhstudio.personalQueue',
  p186: 'rhstudio.param186',
  p147: 'rhstudio.param147',
  p192: 'rhstudio.param192',
  loraName: 'rhstudio.loraName',
  loraStrength: 'rhstudio.loraStrength',
  b171: 'rhstudio.bool171',
  b163: 'rhstudio.bool163',
  b185: 'rhstudio.bool185',
  b169: 'rhstudio.bool169',
  b158: 'rhstudio.bool158'
};

const MEDIA = {
  img141: { nodeId:'141', fieldName:'image', kind:'image' },
  img142: { nodeId:'142', fieldName:'image', kind:'image' },
  img143: { nodeId:'143', fieldName:'image', kind:'image' },
  audio144: { nodeId:'144', fieldName:'audio', kind:'audio' },
  video164: { nodeId:'164', fieldName:'video', kind:'video' },
  img161: { nodeId:'161', fieldName:'image', kind:'image' },
  img175: { nodeId:'175', fieldName:'image', kind:'image' },
  img176: { nodeId:'176', fieldName:'image', kind:'image' },
  audio160: { nodeId:'160', fieldName:'audio', kind:'audio' },
  audio189: { nodeId:'189', fieldName:'audio', kind:'audio' }
};

const state = {
  files: {},
  objectUrls: {},
  task: null,
  poll: null,
  running: false
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[c]));

function toast(message, type='') {
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
  return key.slice(0,4) + '••••••••' + key.slice(-4);
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

function setStoredInput(id, key, fallback) {
  const el = $('#' + id);
  const value = localStorage.getItem(key);
  el.value = value ?? fallback;
}

function setStoredCheck(id, key, fallback=false) {
  const el = $('#' + id);
  const value = localStorage.getItem(key);
  el.checked = value == null ? fallback : value === 'true';
}

function persist() {
  localStorage.setItem(LS.app, $('#appId').value.trim() || APP_ID);
  localStorage.setItem(LS.prompt, $('#promptInput').value);
  localStorage.setItem(LS.aspect, $('#aspectRatio').value);
  localStorage.setItem(LS.inst, $('#instanceType').value);
  localStorage.setItem(LS.queue, $('#personalQueue').value);
  localStorage.setItem(LS.p186, $('#param186').value);
  localStorage.setItem(LS.p147, $('#param147').value);
  localStorage.setItem(LS.p192, $('#param192').value);
  localStorage.setItem(LS.loraName, $('#loraName').value);
  localStorage.setItem(LS.loraStrength, $('#loraStrength').value);
  localStorage.setItem(LS.b171, String($('#bool171').checked));
  localStorage.setItem(LS.b163, String($('#bool163').checked));
  localStorage.setItem(LS.b185, String($('#bool185').checked));
  localStorage.setItem(LS.b169, String($('#bool169').checked));
  localStorage.setItem(LS.b158, String($('#bool158').checked));
}

function loadConfig() {
  setStoredInput('appId', LS.app, APP_ID);
  setStoredInput('promptInput', LS.prompt, '');
  setStoredInput('aspectRatio', LS.aspect, '9:16 (Portrait Widescreen)');
  setStoredInput('instanceType', LS.inst, 'default');
  setStoredInput('personalQueue', LS.queue, 'false');
  setStoredInput('param186', LS.p186, '10');
  setStoredInput('param147', LS.p147, '0.4');
  setStoredInput('param192', LS.p192, '8');
  setStoredInput('loraName', LS.loraName, 'MysticXXX_MMH3-V1.safetensors');
  setStoredInput('loraStrength', LS.loraStrength, '0.4');
  setStoredCheck('bool171', LS.b171, false);
  setStoredCheck('bool163', LS.b163, false);
  setStoredCheck('bool185', LS.b185, false);
  setStoredCheck('bool169', LS.b169, false);
  setStoredCheck('bool158', LS.b158, false);
  updatePromptCount();
  updateRatioChip();
}

[
  'appId','promptInput','aspectRatio','instanceType','personalQueue',
  'param186','param147','param192','loraName','loraStrength',
  'bool171','bool163','bool185','bool169','bool158'
].forEach(id => {
  const el = $('#' + id);
  el.addEventListener('input', () => {
    persist();
    if (id === 'promptInput') updatePromptCount();
    if (id === 'aspectRatio') updateRatioChip();
  });
  el.addEventListener('change', () => {
    persist();
    if (id === 'aspectRatio') updateRatioChip();
  });
});

function updatePromptCount() {
  $('#promptCount').textContent = String($('#promptInput').value.length);
}

function updateRatioChip() {
  const value = $('#aspectRatio').value || '';
  $('#ratioChip').textContent = value.split(' ')[0] || '9:16';
}

function openDrawer(name) {
  const map = {
    settings: '#settingsOverlay',
    moreRefs: '#moreRefsOverlay',
    advanced: '#advancedOverlay'
  };
  Object.values(map).forEach(sel => $(sel).classList.add('hidden'));
  $(map[name]).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  if (name === 'settings') $('#apiKeyInput').value = '';
}

function closeDrawers() {
  $$('.drawer-overlay').forEach(el => el.classList.add('hidden'));
  document.body.style.overflow = '';
}

$('#openSettings').onclick = () => openDrawer('settings');
$('#openMoreRefs').onclick = () => openDrawer('moreRefs');
$('#openAdvanced').onclick = () => openDrawer('advanced');
$$('[data-close]').forEach(el => el.onclick = closeDrawers);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrawers();
});

function setFile(slot, file) {
  clearFile(slot, false);
  if (!file) return;
  state.files[slot] = file;
  if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
    state.objectUrls[slot] = URL.createObjectURL(file);
  }
  renderFileSlot(slot);
}

function clearFile(slot, rerender=true) {
  if (state.objectUrls[slot]) {
    URL.revokeObjectURL(state.objectUrls[slot]);
    delete state.objectUrls[slot];
  }
  delete state.files[slot];
  if (rerender) renderFileSlot(slot);
}

function renderFileSlot(slot) {
  const file = state.files[slot];
  const primary = $('.media-slot[data-slot="' + slot + '"]');
  const drawer = $('.drawer-media[data-slot="' + slot + '"]');

  if (primary) {
    primary.classList.toggle('has-file', !!file);
    const preview = primary.querySelector('.slot-preview');
    const clear = primary.querySelector('.slot-clear');
    clear.classList.toggle('hidden', !file);

    if (!file) {
      const label = slot === 'video164' ? 'V' : String(['img141','img142','img143'].indexOf(slot) + 1).padStart(2,'0');
      preview.innerHTML = '<span>' + label + '</span><i>＋</i>';
      primary.querySelector('.slot-copy strong').textContent =
        slot === 'video164' ? '参考视频' : '参考图 ' + (['img141','img142','img143'].indexOf(slot) + 1);
    } else {
      const url = state.objectUrls[slot];
      if (file.type.startsWith('image/')) {
        preview.innerHTML = '<img src="' + esc(url) + '" alt="">';
      } else if (file.type.startsWith('video/')) {
        preview.innerHTML = '<video src="' + esc(url) + '" muted playsinline></video>';
      }
      primary.querySelector('.slot-copy strong').textContent = file.name;
    }
  }

  if (drawer) {
    drawer.classList.toggle('has-file', !!file);
    drawer.querySelector('.drawer-file-state').textContent = file ? file.name : '未选择';
  }
}

$$('.media-slot,.drawer-media').forEach(el => {
  const slot = el.dataset.slot;
  const input = el.querySelector('input[type="file"]');

  el.addEventListener('click', e => {
    if (e.target.closest('.slot-clear')) {
      e.preventDefault();
      e.stopPropagation();
      clearFile(slot);
      input.value = '';
      return;
    }
    input.click();
  });

  input.addEventListener('click', e => e.stopPropagation());

  input.addEventListener('change', e => {
    e.stopPropagation();
    const file = input.files[0];
    if (file) setFile(slot, file);
  });
});

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  const units = ['B','KB','MB','GB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return n.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

async function uploadFile(file, key) {
  const fd = new FormData();
  fd.append('file', file, file.name);

  const res = await fetch('/api/rh/upload', {
    method:'POST',
    headers:{'x-rh-key':key},
    body:fd
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

function setStatus(status, meta='') {
  const dot = $('#statusDot');
  dot.className = 'status-dot';
  if (status === 'RUNNING' || status === 'QUEUED' || status === 'UPLOADING' || status === 'SUBMITTING') dot.classList.add('running');
  if (status === 'SUCCESS') dot.classList.add('success');
  if (status === 'FAILED') dot.classList.add('failed');

  const names = {
    IDLE:'等待生成',
    UPLOADING:'上传参考素材',
    SUBMITTING:'提交任务',
    QUEUED:'排队中',
    RUNNING:'生成中',
    SUCCESS:'生成完成',
    FAILED:'生成失败'
  };

  $('#statusText').textContent = names[status] || status;
  $('#taskMeta').textContent = meta || 'READY';
}

function renderIdle() {
  setStatus('IDLE','READY');
  $('#resultArea').innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-mark">▶</div>' +
      '<strong>准备生成你的下一段视频</strong>' +
      '<span>添加参考素材并输入提示词，生成结果会直接显示在这里。</span>' +
    '</div>';
}

function renderLoading(status, taskId) {
  setStatus(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  $('#resultArea').innerHTML =
    '<div class="loading-state">' +
      '<div class="loading-mark"></div>' +
      '<strong>' + (status === 'QUEUED' ? '任务正在排队' : '视频正在生成') + '</strong>' +
      '<span>状态每 3 秒自动刷新。</span>' +
    '</div>';
}

function isVideo(item) {
  const type = String(item?.outputType || '').toLowerCase();
  const url = String(item?.url || '').toLowerCase();
  return type.includes('video') || ['mp4','webm','mov','m4v'].includes(type) || /\.(mp4|webm|mov|m4v)(\?|$)/.test(url);
}

function isImage(item) {
  const type = String(item?.outputType || '').toLowerCase();
  const url = String(item?.url || '').toLowerCase();
  return type.includes('image') || ['png','jpg','jpeg','webp','gif','avif'].includes(type) || /\.(png|jpe?g|webp|gif|avif)(\?|$)/.test(url);
}

function renderSuccess(task) {
  const results = Array.isArray(task?.results) ? task.results : [];
  const primary = results.find(isVideo) || results.find(isImage) || results[0];
  setStatus('SUCCESS', task?.taskId ? ('TASK · ' + task.taskId) : 'DONE');

  if (!primary) {
    $('#resultArea').innerHTML =
      '<div class="empty-state"><div class="empty-mark">✓</div><strong>任务完成</strong><span>没有返回可预览媒体。</span></div>';
    return;
  }

  const url = primary.url || '';
  const type = String(primary.outputType || 'output').toLowerCase();
  let media = '';

  if (isVideo(primary) && url) {
    media = '<video src="' + esc(url) + '" controls playsinline autoplay></video>';
  } else if (isImage(primary) && url) {
    media = '<img src="' + esc(url) + '" alt="generated output">';
  } else if (primary.text) {
    media = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  } else {
    media = '<div class="file-state"><strong>' + esc(type.toUpperCase()) + '</strong></div>';
  }

  let meta =
    '<div class="output-meta">' +
      '<span>' + esc(type || 'output') +
      (results.length > 1 ? (' · ' + results.length + ' 个输出') : '') +
      ' · 链接有效期 24h</span>';

  if (url) {
    meta += '<a href="' + esc(url) + '" target="_blank" rel="noreferrer">打开原文件 ↗</a>';
  }

  meta += '</div>';
  $('#resultArea').innerHTML = media + meta;
}

function renderFailed(task, message) {
  setStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');

  let reason = message || task?.errorMessage || '';
  if (!reason && task?.failedReason) {
    try { reason = JSON.stringify(task.failedReason); } catch {}
  }

  $('#resultArea').innerHTML =
    '<div class="error-state">' +
      '<div class="empty-mark">!</div>' +
      '<strong>生成失败</strong>' +
      '<span>' + esc(reason || 'RunningHub 返回任务失败。') + '</span>' +
    '</div>';
}

function getAdvancedNodeInfo() {
  return [
    {nodeId:'171',fieldName:'value',fieldValue:String($('#bool171').checked),description:null},
    {nodeId:'163',fieldName:'value',fieldValue:String($('#bool163').checked),description:null},
    {nodeId:'185',fieldName:'value',fieldValue:String($('#bool185').checked),description:null},
    {nodeId:'186',fieldName:'value',fieldValue:String($('#param186').value || '10'),description:null},
    {nodeId:'147',fieldName:'value',fieldValue:String($('#param147').value || '0.4'),description:null},
    {nodeId:'192',fieldName:'value',fieldValue:String($('#param192').value || '8'),description:null},
    {nodeId:'159',fieldName:'lora_name',fieldValue:String($('#loraName').value || 'MysticXXX_MMH3-V1.safetensors'),description:null},
    {nodeId:'159',fieldName:'strength_model',fieldValue:String($('#loraStrength').value || '0.4'),description:null},
    {nodeId:'169',fieldName:'value',fieldValue:String($('#bool169').checked),description:null},
    {nodeId:'158',fieldName:'value',fieldValue:String($('#bool158').checked),description:null}
  ];
}

async function runTask() {
  if (state.running) return;

  const key = apiKey();
  if (!key) {
    toast('请先在设置中保存 RunningHub API Key','bad');
    openDrawer('settings');
    return;
  }

  const prompt = $('#promptInput').value.trim();
  if (!prompt) {
    toast('请输入视频提示词','bad');
    $('#promptInput').focus();
    return;
  }

  const appId = $('#appId').value.trim() || APP_ID;
  const selectedFiles = Object.entries(state.files);

  state.running = true;
  $('#runBtn').disabled = true;
  $('.generate-label').textContent = '准备任务…';

  try {
    const uploadValues = {};
    let uploaded = 0;

    for (const [slot, file] of selectedFiles) {
      uploaded++;
      setStatus('UPLOADING', uploaded + ' / ' + selectedFiles.length);
      $('.generate-label').textContent = '上传素材 ' + uploaded + '/' + selectedFiles.length;
      uploadValues[slot] = await uploadFile(file, key);
    }

    const nodeInfoList = [
      {nodeId:'150',fieldName:'value',fieldValue:prompt,description:null},
      {nodeId:'115',fieldName:'aspect_ratio',fieldValue:$('#aspectRatio').value,description:null},
      ...getAdvancedNodeInfo()
    ];

    for (const [slot, config] of Object.entries(MEDIA)) {
      nodeInfoList.push({
        nodeId:config.nodeId,
        fieldName:config.fieldName,
        fieldValue:uploadValues[slot] || 'None',
        description:null
      });
    }

    setStatus('SUBMITTING','RUNNINGHUB');
    $('.generate-label').textContent = '提交任务…';

    const res = await fetch('/api/rh/run', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-rh-key':key
      },
      body:JSON.stringify({
        appId,
        nodeInfoList,
        instanceType:$('#instanceType').value,
        usePersonalQueue:$('#personalQueue').value
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || ('提交失败 (' + res.status + ')'));

    state.task = data;
    toast('视频生成任务已提交','good');

    if (data.status === 'SUCCESS') {
      renderSuccess(data);
    } else if (data.status === 'FAILED') {
      renderFailed(data);
    } else {
      renderLoading(data.status || 'RUNNING', data.taskId);
      if (data.taskId) {
        clearInterval(state.poll);
        state.poll = setInterval(() => queryTask(data.taskId), 3000);
      }
    }
  } catch (error) {
    renderFailed(state.task, error?.message || '运行失败');
    toast(error?.message || '运行失败','bad');
  } finally {
    state.running = false;
    $('#runBtn').disabled = false;
    $('.generate-label').textContent = '开始生成';
  }
}

async function queryTask(taskId) {
  try {
    const res = await fetch('/api/rh/query', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-rh-key':apiKey()
      },
      body:JSON.stringify({taskId})
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || ('查询失败 (' + res.status + ')'));

    state.task = data;
    const status = data.status || 'RUNNING';

    if (status === 'SUCCESS') {
      clearInterval(state.poll);
      state.poll = null;
      renderSuccess(data);
      toast('视频生成完成','good');
    } else if (status === 'FAILED') {
      clearInterval(state.poll);
      state.poll = null;
      renderFailed(data);
      toast('视频生成失败','bad');
    } else {
      renderLoading(status, data.taskId || taskId);
    }
  } catch (error) {
    clearInterval(state.poll);
    state.poll = null;
    renderFailed(state.task, error?.message || '任务查询失败');
    toast(error?.message || '任务查询失败','bad');
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
  if (!value) return toast('请输入 API Key','bad');
  localStorage.setItem(LS.key,value);
  $('#apiKeyInput').value = '';
  updateKeyUI();
  toast('API Key 已保存到当前浏览器','good');
};

$('#clearKey').onclick = () => {
  localStorage.removeItem(LS.key);
  $('#apiKeyInput').value = '';
  updateKeyUI();
  toast('API Key 已清除');
};

$('#clearLocal').onclick = () => {
  Object.values(LS).filter(k => k !== LS.key).forEach(k => localStorage.removeItem(k));
  Object.keys(state.files).forEach(slot => clearFile(slot));
  loadConfig();
  renderIdle();
  toast('本地应用配置已重置');
};

loadConfig();
updateKeyUI();
Object.keys(MEDIA).forEach(renderFileSlot);
renderIdle();
