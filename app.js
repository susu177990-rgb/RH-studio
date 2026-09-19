const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const APP_ID = '2084320751339032577';

const LS = {
  key: 'rhstudio.apiKey',
  app: 'rhstudio.appId',
  prompt: 'rhstudio.prompt',
  aspect: 'rhstudio.aspectRatio',
  quality: 'rhstudio.qualityPreset'
};

const MEDIA = {
  img141: { nodeId:'141', fieldName:'image', kind:'image', label:'参考图 1' },
  img142: { nodeId:'142', fieldName:'image', kind:'image', label:'参考图 2' },
  img143: { nodeId:'143', fieldName:'image', kind:'image', label:'参考图 3' },
  img161: { nodeId:'161', fieldName:'image', kind:'image', label:'参考图 4' },
  img175: { nodeId:'175', fieldName:'image', kind:'image', label:'参考图 5' },
  img176: { nodeId:'176', fieldName:'image', kind:'image', label:'参考图 6' },
  video164: { nodeId:'164', fieldName:'video', kind:'video', label:'参考视频' },
  audio144: { nodeId:'144', fieldName:'audio', kind:'audio', label:'音频 1' },
  audio160: { nodeId:'160', fieldName:'audio', kind:'audio', label:'音频 2' },
  audio189: { nodeId:'189', fieldName:'audio', kind:'audio', label:'音频 3' }
};

const state = {
  files: {},
  objectUrls: {},
  task: null,
  poll: null,
  running: false,
  outputUrl: '',
  outputType: ''
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

function persist() {
  localStorage.setItem(LS.app, $('#appId').value.trim() || APP_ID);
  localStorage.setItem(LS.prompt, $('#promptInput').value);
  localStorage.setItem(LS.aspect, $('#aspectRatio').value);
  localStorage.setItem(LS.quality, $('#qualityPreset').value);
}

function loadConfig() {
  $('#appId').value = localStorage.getItem(LS.app) || APP_ID;
  $('#promptInput').value = localStorage.getItem(LS.prompt) || '';
  $('#aspectRatio').value = localStorage.getItem(LS.aspect) || '9:16 (Portrait Widescreen)';
  $('#qualityPreset').value = localStorage.getItem(LS.quality) || '0.9';
  updatePromptCount();
  updateRatioChip();
}

['appId','promptInput','aspectRatio','qualityPreset'].forEach(id => {
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

function openSettings() {
  $('#apiKeyInput').value = '';
  $('#settingsOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeSettings() {
  $('#settingsOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

$('#openSettings').onclick = openSettings;
$$('[data-close]').forEach(el => el.onclick = closeSettings);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSettings();
});

function clearFile(slot, rerender=true) {
  if (state.objectUrls[slot]) {
    URL.revokeObjectURL(state.objectUrls[slot]);
    delete state.objectUrls[slot];
  }
  delete state.files[slot];
  if (rerender) renderFileSlot(slot);
}

function setFile(slot, file) {
  clearFile(slot, false);
  if (!file) return;
  state.files[slot] = file;
  if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
    state.objectUrls[slot] = URL.createObjectURL(file);
  }
  renderFileSlot(slot);
}

function renderFileSlot(slot) {
  const config = MEDIA[slot];
  const file = state.files[slot];
  const el = $('.upload-slot[data-slot="' + slot + '"]');
  if (!el) return;

  el.classList.toggle('has-file', !!file);
  el.querySelector('.slot-clear')?.classList.toggle('hidden', !file);

  if (config.kind === 'image') {
    const preview = el.querySelector('.media-preview');
    const caption = el.querySelector('.media-caption strong');
    const index = ['img141','img142','img143','img161','img175','img176'].indexOf(slot) + 1;
    if (file) {
      preview.innerHTML = '<img src="' + esc(state.objectUrls[slot]) + '" alt="">';
      caption.textContent = file.name;
    } else {
      preview.innerHTML = '<span>' + String(index).padStart(2,'0') + '</span><i>＋</i>';
      caption.textContent = config.label;
    }
  }

  if (config.kind === 'video') {
    const preview = el.querySelector('.video-reference-preview');
    const title = el.querySelector('.video-reference-copy strong');
    const subtitle = el.querySelector('.video-reference-copy small');
    if (file) {
      preview.innerHTML = '<video src="' + esc(state.objectUrls[slot]) + '" muted playsinline preload="metadata"></video>';
      title.textContent = file.name;
      subtitle.textContent = '已选择参考视频';
    } else {
      preview.innerHTML = '<span>VIDEO</span><i>＋</i>';
      title.textContent = '参考视频';
      subtitle.textContent = '支持上传本地视频作为结构 / 动作 / 镜头参考';
    }
  }

  if (config.kind === 'audio') {
    const title = el.querySelector('strong');
    const small = el.querySelector('small');
    title.textContent = file ? file.name : config.label;
    small.textContent = file ? '已选择' : 'AUDIO';
  }
}

$$('.upload-slot').forEach(el => {
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
  if (['RUNNING','QUEUED','UPLOADING','SUBMITTING'].includes(status)) dot.classList.add('running');
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

function setDownload(url='', type='') {
  state.outputUrl = url || '';
  state.outputType = type || '';
  $('#downloadBtn').disabled = !state.outputUrl;
}

function renderIdle() {
  setStatus('IDLE','READY');
  setDownload();
  $('#resultArea').innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-mark">▶</div>' +
      '<strong>准备生成你的下一段视频</strong>' +
      '<span>添加参考素材并输入提示词，生成结果会直接显示在这里。</span>' +
    '</div>';
}

function renderLoading(status, taskId) {
  setStatus(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  setDownload();
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
    setDownload();
    $('#resultArea').innerHTML =
      '<div class="empty-state"><div class="empty-mark">✓</div><strong>任务完成</strong><span>没有返回可预览媒体。</span></div>';
    return;
  }

  const url = primary.url || '';
  const type = String(primary.outputType || 'output').toLowerCase();
  setDownload(url, type);

  if (isVideo(primary) && url) {
    $('#resultArea').innerHTML = '<video src="' + esc(url) + '" controls playsinline autoplay></video>';
  } else if (isImage(primary) && url) {
    $('#resultArea').innerHTML = '<img src="' + esc(url) + '" alt="generated output">';
  } else if (primary.text) {
    $('#resultArea').innerHTML = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  } else {
    $('#resultArea').innerHTML = '<div class="file-state"><strong>' + esc(type.toUpperCase()) + '</strong></div>';
  }
}

function renderFailed(task, message) {
  setStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');
  setDownload();

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

function getFixedNodeInfo() {
  return [
    {nodeId:'171',fieldName:'value',fieldValue:'false',description:null},
    {nodeId:'163',fieldName:'value',fieldValue:'false',description:null},
    {nodeId:'185',fieldName:'value',fieldValue:'false',description:null},
    {nodeId:'186',fieldName:'value',fieldValue:'10',description:null},
    {nodeId:'147',fieldName:'value',fieldValue:String($('#qualityPreset').value || '0.9'),description:null},
    {nodeId:'192',fieldName:'value',fieldValue:'8',description:null},
    {nodeId:'159',fieldName:'lora_name',fieldValue:'MysticXXX_MMH3-V1.safetensors',description:null},
    {nodeId:'159',fieldName:'strength_model',fieldValue:'0.4',description:null},
    {nodeId:'169',fieldName:'value',fieldValue:'false',description:null},
    {nodeId:'158',fieldName:'value',fieldValue:'false',description:null}
  ];
}

async function runTask() {
  if (state.running) return;

  const key = apiKey();
  if (!key) {
    toast('请先在设置中保存 RunningHub API Key','bad');
    openSettings();
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
  setDownload();

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
      ...getFixedNodeInfo()
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
        instanceType:'default',
        usePersonalQueue:'false'
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

async function downloadOutput() {
  if (!state.outputUrl) return;

  const btn = $('#downloadBtn');
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span>下载中</span><b>↓</b>';

  try {
    const res = await fetch(state.outputUrl);
    if (!res.ok) throw new Error('download failed');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ext = (state.outputType || 'mp4').replace(/[^a-z0-9]/gi,'') || 'mp4';
    a.href = objectUrl;
    a.download = 'rh-studio-output.' + ext;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    toast('已开始下载','good');
  } catch {
    const a = document.createElement('a');
    a.href = state.outputUrl;
    a.target = '_blank';
    a.rel = 'noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('已打开原文件，请在浏览器中保存');
  } finally {
    btn.disabled = !state.outputUrl;
    btn.innerHTML = original;
  }
}

$('#runBtn').onclick = runTask;
$('#downloadBtn').onclick = downloadOutput;

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
  [LS.app,LS.prompt,LS.aspect,LS.quality].forEach(k => localStorage.removeItem(k));
  Object.keys(state.files).forEach(slot => clearFile(slot));
  loadConfig();
  renderIdle();
  toast('本地应用配置已重置');
};

loadConfig();
updateKeyUI();
Object.keys(MEDIA).forEach(renderFileSlot);
renderIdle();
