const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const APPS = {
  'minimax-h3': {
    key: 'minimax-h3',
    appId: '2084320751339032577',
    name: 'MinimaxH3多参生视频',
    subtitle: '量化加速 V3版',
    title: 'MinimaxH3多参生视频 · 量化加速V3版',
    type: 'video'
  },
  'image-2mp': {
    key: 'image-2mp',
    appId: '2086825499864018945',
    name: '2MP 文生图',
    subtitle: '纯文本生成',
    title: '2MP 文生图 · 纯文本生成',
    type: 'image'
  },
  'image-2mp-upscale': {
    key: 'image-2mp-upscale',
    appId: '2090951249314521089',
    name: 'krea2 raw turbo dual mining 2 Claire',
    subtitle: '8 Steps · Euler A',
    title: 'krea2 raw turbo dual mining 2 Claire · 8 Steps',
    type: 'image'
  }
};

const APP_KEYS = {
  video: 'minimax-h3',
  image: 'image-2mp',
  imageUpscale: 'image-2mp-upscale'
};

const RH_UPLOAD_DIRECT = 'https://www.runninghub.ai/openapi/v2/media/upload/binary';
const MAX_RH_UPLOAD_BYTES = 30 * 1024 * 1024;

const LS = {
  key: 'rhstudio.apiKey',
  active: 'rhstudio.activeApp',
  prompt: 'rhstudio.prompt',
  aspect: 'rhstudio.aspectRatio',
  quality: 'rhstudio.qualityPreset',
  duration: 'rhstudio.duration',
  imagePrompt: 'rhstudio.image2mp.prompt',
  imageAspect: 'rhstudio.image2mp.aspectRatio',
  imageUpscalePrompt: 'rhstudio.image2mpUpscale.prompt',
  imageUpscaleAspect: 'rhstudio.image2mpUpscale.aspectRatio',
  inst: 'rhstudio.instanceType',
  history: 'rhstudio.generationHistory'
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
  activeApp: APP_KEYS.video,
  files: {},
  objectUrls: {}
};

const videoState = {
  task: null,
  poll: null,
  running: false,
  outputUrl: '',
  outputSourceUrl: '',
  outputType: ''
};

const imageState = {
  task: null,
  poll: null,
  running: false,
  outputUrl: '',
  outputSourceUrl: '',
  outputType: ''
};

const imageUpscaleState = {
  task: null,
  poll: null,
  running: false,
  outputUrl: '',
  outputSourceUrl: '',
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

function instanceLabel(value) {
  return {default:'24G',plus:'48G',ultra:'84G'}[value] || value || '24G';
}

function qualityLabel(value) {
  return {'0.4':'480P','0.9':'720P','2.0':'1080P'}[String(value)] || String(value || '');
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

function setActiveApp(key, persist=true) {
  if (!APPS[key]) key = APP_KEYS.video;
  state.activeApp = key;

  $$('.app-item').forEach(item => {
    item.classList.toggle('active', item.dataset.app === key);
  });

  $('#workspaceVideo').classList.toggle('hidden', key !== APP_KEYS.video);
  $('#workspaceImage').classList.toggle('hidden', key !== APP_KEYS.image);
  $('#workspaceImageUpscale').classList.toggle('hidden', key !== APP_KEYS.imageUpscale);

  const app = APPS[key];
  $('#currentAppTitle').textContent = app.title;
  $('#settingsCurrentApp').textContent = app.title;

  if (persist) localStorage.setItem(LS.active, key);
}

function persistVideoConfig() {
  localStorage.setItem(LS.prompt, $('#promptInput').value);
  localStorage.setItem(LS.aspect, $('#aspectRatio').value);
  localStorage.setItem(LS.quality, $('#qualityPreset').value);
  localStorage.setItem(LS.duration, $('#durationRange').value);
}

function persistImageConfig() {
  localStorage.setItem(LS.imagePrompt, $('#imagePromptInput').value);
  localStorage.setItem(LS.imageAspect, $('#imageAspectRatio').value);
}

function persistImageUpscaleConfig() {
  localStorage.setItem(LS.imageUpscalePrompt, $('#imageUpscalePromptInput').value);
  localStorage.setItem(LS.imageUpscaleAspect, $('#imageUpscaleAspectRatio').value);
}

function loadConfig() {
  $('#promptInput').value = localStorage.getItem(LS.prompt) || '';
  $('#aspectRatio').value = localStorage.getItem(LS.aspect) || '9:16 (Portrait Widescreen)';
  $('#qualityPreset').value = localStorage.getItem(LS.quality) || '0.9';

  const savedDuration = Number(localStorage.getItem(LS.duration) || 10);
  const normalizedDuration = Math.min(15, Math.max(5, Number.isFinite(savedDuration) ? savedDuration : 10));
  $('#durationRange').value = String(normalizedDuration);
  localStorage.setItem(LS.duration, String(normalizedDuration));

  $('#imagePromptInput').value = localStorage.getItem(LS.imagePrompt) || '';
  $('#imageAspectRatio').value = localStorage.getItem(LS.imageAspect) || '9:16 (Portrait Widescreen)';
  $('#imageUpscalePromptInput').value = localStorage.getItem(LS.imageUpscalePrompt) || '';
  $('#imageUpscaleAspectRatio').value = localStorage.getItem(LS.imageUpscaleAspect) || '3:4 (Portrait Standard)';
  $('#instanceType').value = localStorage.getItem(LS.inst) || 'default';

  updateDurationUI();
  updatePromptCount();
  updateImagePromptCount();
  updateImageUpscalePromptCount();
}

function updateDurationUI() {
  const range = $('#durationRange');
  const min = Number(range.min || 5);
  const max = Number(range.max || 15);
  const raw = Number(range.value || 10);
  const value = Math.min(max, Math.max(min, Number.isFinite(raw) ? raw : 10));

  if (Number(range.value) !== value) {
    range.value = String(value);
    localStorage.setItem(LS.duration, String(value));
  }

  $('#durationValue').textContent = value + 's';
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  range.style.background = 'linear-gradient(90deg,var(--accent) ' + pct + '%,rgba(255,255,255,.08) ' + pct + '%)';
}

function updatePromptCount() {
  $('#promptCount').textContent = String($('#promptInput').value.length);
}

function updateImagePromptCount() {
  $('#imagePromptCount').textContent = String($('#imagePromptInput').value.length);
}

function updateImageUpscalePromptCount() {
  $('#imageUpscalePromptCount').textContent = String($('#imageUpscalePromptInput').value.length);
}

['promptInput','aspectRatio','qualityPreset','durationRange'].forEach(id => {
  const el = $('#' + id);
  el.addEventListener('input', () => {
    persistVideoConfig();
    if (id === 'promptInput') updatePromptCount();
    if (id === 'durationRange') updateDurationUI();
  });
  el.addEventListener('change', persistVideoConfig);
});

['imagePromptInput','imageAspectRatio'].forEach(id => {
  const el = $('#' + id);
  el.addEventListener('input', () => {
    persistImageConfig();
    if (id === 'imagePromptInput') updateImagePromptCount();
  });
  el.addEventListener('change', persistImageConfig);
});

['imageUpscalePromptInput','imageUpscaleAspectRatio'].forEach(id => {
  const el = $('#' + id);
  el.addEventListener('input', () => {
    persistImageUpscaleConfig();
    if (id === 'imageUpscalePromptInput') updateImageUpscalePromptCount();
  });
  el.addEventListener('change', persistImageUpscaleConfig);
});

$('#instanceType').addEventListener('change', () => {
  localStorage.setItem(LS.inst, $('#instanceType').value);
});

$$('.app-item').forEach(item => {
  item.addEventListener('click', () => setActiveApp(item.dataset.app));
});

function getHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(LS.history) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem(LS.history, JSON.stringify(items.slice(0, 50)));
  } catch {}
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

function upsertHistory(appKey, task, extra={}) {
  const taskId = String(task?.taskId || extra.taskId || '').trim();
  if (!taskId) return;

  const app = APPS[appKey] || APPS[APP_KEYS.video];
  const items = getHistory();
  const previous = items.find(item => item.taskId === taskId) || {};
  const results = Array.isArray(task?.results) ? task.results : [];
  const primary = results.find(isVideo) || results.find(isImage) || results[0] || null;

  const next = {
    ...previous,
    taskId,
    appKey,
    appName: app.name,
    status: task?.status || extra.status || previous.status || 'RUNNING',
    createdAt: previous.createdAt || extra.createdAt || Date.now(),
    updatedAt: Date.now(),
    aspect: extra.aspect || previous.aspect || '',
    quality: extra.quality || previous.quality || '',
    duration: extra.duration || previous.duration || '',
    instance: extra.instance || previous.instance || instanceLabel($('#instanceType').value),
    prompt: extra.prompt ?? previous.prompt ?? '',
    resultUrl: primary?.url || previous.resultUrl || '',
    outputType: primary?.outputType || previous.outputType || '',
    errorCode: task?.errorCode || previous.errorCode || '',
    errorMessage: task?.errorMessage || previous.errorMessage || ''
  };

  saveHistory([next, ...items.filter(item => item.taskId !== taskId)]);
}

function closeDrawers() {
  $$('.drawer-overlay').forEach(el => el.classList.add('hidden'));
  document.body.style.overflow = '';
}

function openSettings() {
  closeDrawers();
  $('#apiKeyInput').value = '';
  $('#settingsCurrentApp').textContent = APPS[state.activeApp].title;
  $('#settingsOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function openHistory() {
  window.location.href = '/history';
}

$('#openSettings').onclick = openSettings;
$('#openHistory').onclick = openHistory;
$$('[data-close]').forEach(el => el.onclick = closeDrawers);

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrawers();
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

  if (file.size > MAX_RH_UPLOAD_BYTES) {
    toast('单个文件不能超过 30MB：' + file.name, 'bad');
    return;
  }

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

function extractUploadValue(data) {
  return (
    data?.data?.fileName ||
    data?.data?.download_url ||
    data?.fileName ||
    data?.download_url ||
    ''
  );
}

async function parseUploadResponse(res) {
  const data = await res.json().catch(() => ({}));
  const apiFailed = data?.code != null && Number(data.code) !== 0;

  if (!res.ok || apiFailed) {
    throw new Error(
      data?.message ||
      data?.msg ||
      data?.errorMessage ||
      data?.error ||
      ('RunningHub 上传失败 (' + res.status + ')')
    );
  }

  const value = extractUploadValue(data);
  if (!value) throw new Error('RunningHub 上传接口未返回可用文件值');
  return value;
}

async function uploadViaRewrite(file, key) {
  const fd = new FormData();
  fd.append('file', file, file.name);

  const res = await fetch('/rh-upload', {
    method:'POST',
    headers:{ Authorization:'Bearer ' + key },
    body:fd
  });

  return parseUploadResponse(res);
}

async function uploadDirect(file, key) {
  const fd = new FormData();
  fd.append('file', file, file.name);

  const res = await fetch(RH_UPLOAD_DIRECT, {
    method:'POST',
    mode:'cors',
    headers:{ Authorization:'Bearer ' + key },
    body:fd
  });

  return parseUploadResponse(res);
}

async function uploadViaLegacyFunction(file, key) {
  const fd = new FormData();
  fd.append('file', file, file.name);

  const res = await fetch('/api/rh/upload', {
    method:'POST',
    headers:{'x-rh-key':key},
    body:fd
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ('文件上传失败 (' + res.status + ')'));

  const value = extractUploadValue(data);
  if (!value) throw new Error('RunningHub 上传接口未返回可用文件值');
  return value;
}

async function uploadFile(file, key) {
  if (file.size > MAX_RH_UPLOAD_BYTES) {
    throw new Error('单个文件不能超过 30MB：' + file.name);
  }

  try {
    return await uploadViaRewrite(file, key);
  } catch (rewriteError) {
    try {
      return await uploadDirect(file, key);
    } catch (directError) {
      if (file.size < 4 * 1024 * 1024) {
        try {
          return await uploadViaLegacyFunction(file, key);
        } catch {}
      }

      throw new Error(
        '文件直传 RunningHub 失败：' +
        (directError?.message || rewriteError?.message || '未知上传错误')
      );
    }
  }
}

async function runRHApp(appId, nodeInfoList) {
  const res = await fetch('/api/rh/run', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'x-rh-key':apiKey()
    },
    body:JSON.stringify({
      appId,
      nodeInfoList,
      instanceType:$('#instanceType').value || 'default',
      usePersonalQueue:'false'
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ('提交失败 (' + res.status + ')'));
  return data;
}

async function queryRH(taskId) {
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
  return data;
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

function generatedImageTag(url, className='') {
  const direct = String(url || '');
  const proxy = toMediaUrl(direct);
  const fallback = proxy && proxy !== direct ? proxy : '';

  return '<img src="' + esc(direct) + '"' +
    (fallback ? ' data-fallback-src="' + esc(fallback) + '"' : '') +
    ' referrerpolicy="no-referrer"' +
    (className ? ' class="' + esc(className) + '"' : '') +
    ' alt="generated image">';
}

function bindGeneratedImageFallbacks(root) {
  if (!root) return;

  root.querySelectorAll('img[data-fallback-src]').forEach(img => {
    img.addEventListener('error', () => {
      if (!img.dataset.fallbackTried && img.dataset.fallbackSrc) {
        img.dataset.fallbackTried = '1';
        img.src = img.dataset.fallbackSrc;
        return;
      }

      img.closest('.image-result-grid')?.classList.add('has-load-error');
      img.closest('.image-output-stage')?.classList.add('has-load-error');
      toast('图片已生成，但预览加载失败', 'bad');
    });
  });
}

function parseMaybeJson(value) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return value; }
}

function formatDiagnostic(value) {
  const parsed = parseMaybeJson(value);
  if (parsed == null || parsed === '') return '';

  if (typeof parsed === 'object') {
    if (!Array.isArray(parsed) && Object.keys(parsed).length === 0) return '';
    try {
      const text = JSON.stringify(parsed, null, 2);
      return text.length > 3600 ? text.slice(0,3600) + '\n…' : text;
    } catch {}
  }

  const text = String(parsed);
  return text.length > 3600 ? text.slice(0,3600) + '\n…' : text;
}

function collectFailureNodes(task) {
  const nodes = new Set();
  const tips = parseMaybeJson(task?.promptTips);
  const reason = parseMaybeJson(task?.failedReason);

  if (tips && typeof tips === 'object' && tips.node_errors && typeof tips.node_errors === 'object') {
    Object.keys(tips.node_errors).forEach(id => nodes.add(String(id)));
  }

  const visit = (value, depth=0) => {
    if (value == null || depth > 6) return;

    if (Array.isArray(value)) {
      value.forEach(v => visit(v, depth + 1));
      return;
    }

    if (typeof value !== 'object') return;

    for (const [key,val] of Object.entries(value)) {
      if (/^(nodeId|node_id)$/i.test(key) && val != null && val !== '') {
        nodes.add(String(val));
      } else if (/^\d+$/.test(key) && val && typeof val === 'object') {
        nodes.add(key);
      }
      visit(val, depth + 1);
    }
  };

  visit(reason);
  return [...nodes];
}

function failureHtml(task, message) {
  const errorCode = String(task?.errorCode || '').trim();
  const errorMessage = String(message || task?.errorMessage || 'RunningHub 返回任务失败。').trim();
  const nodes = collectFailureNodes(task);
  const failedReason = formatDiagnostic(task?.failedReason);
  const promptTips = formatDiagnostic(task?.promptTips);

  let details = '';
  if (errorCode) {
    details += '<div class="failure-row"><span>ERROR CODE</span><b>' + esc(errorCode) + '</b></div>';
  }
  if (nodes.length) {
    details += '<div class="failure-row"><span>出错节点</span><b>' + esc(nodes.join(', ')) + '</b></div>';
  }
  if (failedReason) {
    details += '<details class="failure-detail" open><summary>failedReason</summary><pre>' + esc(failedReason) + '</pre></details>';
  }
  if (promptTips) {
    details += '<details class="failure-detail"><summary>promptTips</summary><pre>' + esc(promptTips) + '</pre></details>';
  }

  return (
    '<div class="error-state diagnostic-error">' +
      '<div class="empty-mark">!</div>' +
      '<strong>生成失败</strong>' +
      '<span class="failure-message">' + esc(errorMessage) + '</span>' +
      (details ? '<div class="failure-diagnostics">' + details + '</div>' : '') +
    '</div>'
  );
}

function statusClass(dot, status) {
  dot.className = 'status-dot';
  if (['RUNNING','QUEUED','UPLOADING','SUBMITTING'].includes(status)) dot.classList.add('running');
  if (status === 'SUCCESS') dot.classList.add('success');
  if (status === 'FAILED') dot.classList.add('failed');
}

function setVideoStatus(status, meta='') {
  const names = {
    IDLE:'等待生成',
    UPLOADING:'上传参考素材',
    SUBMITTING:'提交任务',
    QUEUED:'排队中',
    RUNNING:'生成中',
    SUCCESS:'生成完成',
    FAILED:'生成失败'
  };

  statusClass($('#statusDot'), status);
  $('#statusText').textContent = names[status] || status;
  $('#taskMeta').textContent = meta || 'READY';
}

function setVideoDownload(url='', type='') {
  videoState.outputSourceUrl = url || '';
  videoState.outputUrl = toMediaUrl(url || '');
  videoState.outputType = type || '';
  $('#downloadBtn').disabled = !videoState.outputUrl;
}

function renderVideoIdle() {
  setVideoStatus('IDLE','READY');
  setVideoDownload();
  $('#resultArea').innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-mark">▶</div>' +
      '<strong>准备生成你的下一段视频</strong>' +
      '<span>添加参考素材并输入提示词，生成结果会直接显示在这里。</span>' +
    '</div>';
}

function renderVideoLoading(status, taskId) {
  setVideoStatus(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  setVideoDownload();
  $('#resultArea').innerHTML =
    '<div class="loading-state">' +
      '<div class="loading-mark"></div>' +
      '<strong>' + (status === 'QUEUED' ? '任务正在排队' : '视频正在生成') + '</strong>' +
      '<span>状态每 3 秒自动刷新。</span>' +
    '</div>';
}

function renderVideoSuccess(task) {
  const results = Array.isArray(task?.results) ? task.results : [];
  const primary = results.find(isVideo) || results.find(isImage) || results[0];

  setVideoStatus('SUCCESS', task?.taskId ? ('TASK · ' + task.taskId) : 'DONE');

  if (!primary) {
    setVideoDownload();
    $('#resultArea').innerHTML =
      '<div class="empty-state"><div class="empty-mark">✓</div><strong>任务完成</strong><span>没有返回可预览媒体。</span></div>';
    return;
  }

  const url = primary.url || '';
  const mediaUrl = toMediaUrl(url);
  const type = String(primary.outputType || 'output').toLowerCase();
  setVideoDownload(url, type);

  if (isVideo(primary) && url) {
    $('#resultArea').innerHTML = '<video src="' + esc(mediaUrl) + '" controls playsinline preload="metadata"></video>';
    const video = $('#resultArea video');
    video?.addEventListener('error', () => {
      const code = video.error?.code || '';
      toast('视频已生成，但浏览器加载失败' + (code ? ' · MEDIA_ERR_' + code : ''), 'bad');
    }, {once:true});
  } else if (isImage(primary) && url) {
    $('#resultArea').innerHTML = '<img src="' + esc(mediaUrl) + '" alt="generated output">';
  } else if (primary.text) {
    $('#resultArea').innerHTML = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  } else {
    $('#resultArea').innerHTML = '<div class="file-state"><strong>' + esc(type.toUpperCase()) + '</strong></div>';
  }
}

function renderVideoFailed(task, message) {
  setVideoStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');
  setVideoDownload();
  $('#resultArea').innerHTML = failureHtml(task, message);
}

function getVideoFixedNodes() {
  return [
    {nodeId:'171',fieldName:'value',fieldValue:'false',description:null},
    {nodeId:'163',fieldName:'value',fieldValue:'false',description:null},
    {nodeId:'185',fieldName:'value',fieldValue:'false',description:null},
    {nodeId:'186',fieldName:'value',fieldValue:String($('#durationRange').value || '10'),description:null},
    {nodeId:'147',fieldName:'value',fieldValue:String($('#qualityPreset').value || '0.9'),description:null},
    {nodeId:'192',fieldName:'value',fieldValue:'8',description:null},
    {nodeId:'159',fieldName:'lora_name',fieldValue:'MysticXXX_MMH3-V1.safetensors',description:null},
    {nodeId:'159',fieldName:'strength_model',fieldValue:'0.4',description:null},
    {nodeId:'169',fieldName:'value',fieldValue:'false',description:null},
    {nodeId:'158',fieldName:'value',fieldValue:'false',description:null}
  ];
}

async function runVideoTask() {
  if (videoState.running) return;

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

  videoState.running = true;
  $('#runBtn').disabled = true;
  $('.generate-label').textContent = '准备任务…';
  setVideoDownload();

  try {
    const selectedFiles = Object.entries(state.files);
    const uploadValues = {};
    let uploaded = 0;

    for (const [slot,file] of selectedFiles) {
      uploaded++;
      setVideoStatus('UPLOADING', uploaded + ' / ' + selectedFiles.length);
      $('.generate-label').textContent = '上传素材 ' + uploaded + '/' + selectedFiles.length;
      uploadValues[slot] = await uploadFile(file, key);
    }

    const nodeInfoList = [
      {nodeId:'150',fieldName:'value',fieldValue:prompt,description:null},
      {nodeId:'115',fieldName:'aspect_ratio',fieldValue:$('#aspectRatio').value,description:null},
      ...getVideoFixedNodes()
    ];

    for (const [slot,config] of Object.entries(MEDIA)) {
      nodeInfoList.push({
        nodeId:config.nodeId,
        fieldName:config.fieldName,
        fieldValue:uploadValues[slot] || 'None',
        description:null
      });
    }

    setVideoStatus('SUBMITTING','RUNNINGHUB');
    $('.generate-label').textContent = '提交任务…';

    const data = await runRHApp(APPS[APP_KEYS.video].appId, nodeInfoList);
    videoState.task = data;

    upsertHistory(APP_KEYS.video, data, {
      createdAt:Date.now(),
      aspect:($('#aspectRatio').value || '').split(' ')[0],
      quality:qualityLabel($('#qualityPreset').value),
      duration:($('#durationRange').value || '10') + 's',
      instance:instanceLabel($('#instanceType').value),
      prompt:prompt.slice(0,120)
    });

    toast('视频生成任务已提交','good');

    if (data.status === 'SUCCESS') {
      renderVideoSuccess(data);
    } else if (data.status === 'FAILED') {
      renderVideoFailed(data);
    } else {
      renderVideoLoading(data.status || 'RUNNING', data.taskId);
      if (data.taskId) {
        clearInterval(videoState.poll);
        videoState.poll = setInterval(() => queryVideoTask(data.taskId), 3000);
      }
    }
  } catch (error) {
    renderVideoFailed(videoState.task, error?.message || '运行失败');
    toast(error?.message || '运行失败','bad');
  } finally {
    videoState.running = false;
    $('#runBtn').disabled = false;
    $('.generate-label').textContent = '开始生成';
  }
}

async function queryVideoTask(taskId) {
  try {
    const data = await queryRH(taskId);
    videoState.task = data;
    const status = data.status || 'RUNNING';

    upsertHistory(APP_KEYS.video, data, {taskId});

    if (status === 'SUCCESS') {
      clearInterval(videoState.poll);
      videoState.poll = null;
      renderVideoSuccess(data);
      toast('视频生成完成','good');
    } else if (status === 'FAILED') {
      clearInterval(videoState.poll);
      videoState.poll = null;
      renderVideoFailed(data);
      toast('视频生成失败','bad');
    } else {
      renderVideoLoading(status, data.taskId || taskId);
    }
  } catch (error) {
    clearInterval(videoState.poll);
    videoState.poll = null;
    renderVideoFailed(videoState.task, error?.message || '任务查询失败');
    toast(error?.message || '任务查询失败','bad');
  }
}

function setImageStatus(status, meta='') {
  const names = {
    IDLE:'等待生成',
    SUBMITTING:'提交任务',
    QUEUED:'排队中',
    RUNNING:'生成中',
    SUCCESS:'生成完成',
    FAILED:'生成失败'
  };

  statusClass($('#imageStatusDot'), status);
  $('#imageStatusText').textContent = names[status] || status;
  $('#imageTaskMeta').textContent = meta || 'READY';
}

function setImageDownload(url='', type='') {
  imageState.outputSourceUrl = url || '';
  imageState.outputUrl = toMediaUrl(url || '');
  imageState.outputType = type || '';
  $('#imageDownloadBtn').disabled = !imageState.outputUrl;
}

function renderImageIdle() {
  setImageStatus('IDLE','READY');
  setImageDownload();
  $('#imageResultArea').innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-mark">＋</div>' +
      '<strong>准备生成图片</strong>' +
      '<span>输入提示词并设置画幅，生成结果会显示在这里。</span>' +
    '</div>';
}

function renderImageLoading(status, taskId) {
  setImageStatus(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  setImageDownload();
  $('#imageResultArea').innerHTML =
    '<div class="loading-state">' +
      '<div class="loading-mark"></div>' +
      '<strong>' + (status === 'QUEUED' ? '任务正在排队' : '图片正在生成') + '</strong>' +
      '<span>状态每 3 秒自动刷新。</span>' +
    '</div>';
}

function renderImageSuccess(task) {
  const results = Array.isArray(task?.results) ? task.results : [];
  const images = results.filter(isImage);
  const primary = images[0] || results[0];

  setImageStatus('SUCCESS', task?.taskId ? ('TASK · ' + task.taskId) : 'DONE');

  if (!primary) {
    setImageDownload();
    $('#imageResultArea').innerHTML =
      '<div class="empty-state"><div class="empty-mark">✓</div><strong>任务完成</strong><span>没有返回可预览图片。</span></div>';
    return;
  }

  const url = primary.url || '';
  const type = String(primary.outputType || 'png').toLowerCase();
  setImageDownload(url, type);

  if (images.length > 1) {
    $('#imageResultArea').innerHTML =
      '<div class="image-result-grid">' +
        images.map(item => generatedImageTag(item.url || '')).join('') +
      '</div>';
    bindGeneratedImageFallbacks($('#imageResultArea'));
  } else if (url) {
    $('#imageResultArea').innerHTML = generatedImageTag(url);
    bindGeneratedImageFallbacks($('#imageResultArea'));
  } else if (primary.text) {
    $('#imageResultArea').innerHTML = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  }
}

function renderImageFailed(task, message) {
  setImageStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');
  setImageDownload();
  $('#imageResultArea').innerHTML = failureHtml(task, message);
}

function getImageNodes(prompt) {
  return [
    {nodeId:'214',fieldName:'text',fieldValue:prompt,description:null},
    {nodeId:'218',fieldName:'value',fieldValue:'false',description:null},
    {nodeId:'180',fieldName:'aspect_ratio',fieldValue:$('#imageAspectRatio').value,description:null},
    {nodeId:'180',fieldName:'megapixels',fieldValue:'2',description:null},
    {nodeId:'179',fieldName:'value',fieldValue:'1',description:null},
    {nodeId:'216',fieldName:'strength_model',fieldValue:'0.45000000000000007',description:null},
    {nodeId:'210',fieldName:'value',fieldValue:'false',description:null}
  ];
}

async function runImageTask() {
  if (imageState.running) return;

  if (!apiKey()) {
    toast('请先在设置中保存 RunningHub API Key','bad');
    openSettings();
    return;
  }

  const prompt = $('#imagePromptInput').value.trim();
  if (!prompt) {
    toast('请输入图片提示词','bad');
    $('#imagePromptInput').focus();
    return;
  }

  imageState.running = true;
  $('#imageRunBtn').disabled = true;
  $('.image-generate-label').textContent = '提交任务…';
  setImageDownload();
  setImageStatus('SUBMITTING','RUNNINGHUB');

  try {
    const data = await runRHApp(APPS[APP_KEYS.image].appId, getImageNodes(prompt));
    imageState.task = data;

    upsertHistory(APP_KEYS.image, data, {
      createdAt:Date.now(),
      aspect:($('#imageAspectRatio').value || '').split(' ')[0],
      quality:'2MP',
      duration:'',
      instance:instanceLabel($('#instanceType').value),
      prompt:prompt.slice(0,120)
    });

    toast('图片生成任务已提交','good');

    if (data.status === 'SUCCESS') {
      renderImageSuccess(data);
    } else if (data.status === 'FAILED') {
      renderImageFailed(data);
    } else {
      renderImageLoading(data.status || 'RUNNING', data.taskId);
      if (data.taskId) {
        clearInterval(imageState.poll);
        imageState.poll = setInterval(() => queryImageTask(data.taskId), 3000);
      }
    }
  } catch (error) {
    renderImageFailed(imageState.task, error?.message || '运行失败');
    toast(error?.message || '运行失败','bad');
  } finally {
    imageState.running = false;
    $('#imageRunBtn').disabled = false;
    $('.image-generate-label').textContent = '开始生成';
  }
}

async function queryImageTask(taskId) {
  try {
    const data = await queryRH(taskId);
    imageState.task = data;
    const status = data.status || 'RUNNING';

    upsertHistory(APP_KEYS.image, data, {taskId});

    if (status === 'SUCCESS') {
      clearInterval(imageState.poll);
      imageState.poll = null;
      renderImageSuccess(data);
      toast('图片生成完成','good');
    } else if (status === 'FAILED') {
      clearInterval(imageState.poll);
      imageState.poll = null;
      renderImageFailed(data);
      toast('图片生成失败','bad');
    } else {
      renderImageLoading(status, data.taskId || taskId);
    }
  } catch (error) {
    clearInterval(imageState.poll);
    imageState.poll = null;
    renderImageFailed(imageState.task, error?.message || '任务查询失败');
    toast(error?.message || '任务查询失败','bad');
  }
}

function setImageUpscaleStatus(status, meta='') {
  const names = {
    IDLE:'等待生成',
    SUBMITTING:'提交任务',
    QUEUED:'排队中',
    RUNNING:'生成中',
    SUCCESS:'生成完成',
    FAILED:'生成失败'
  };

  statusClass($('#imageUpscaleStatusDot'), status);
  $('#imageUpscaleStatusText').textContent = names[status] || status;
  $('#imageUpscaleTaskMeta').textContent = meta || 'READY';
}

function setImageUpscaleDownload(url='', type='') {
  imageUpscaleState.outputSourceUrl = url || '';
  imageUpscaleState.outputUrl = toMediaUrl(url || '');
  imageUpscaleState.outputType = type || '';
  $('#imageUpscaleDownloadBtn').disabled = !imageUpscaleState.outputUrl;
}

function renderImageUpscaleIdle() {
  setImageUpscaleStatus('IDLE','READY');
  setImageUpscaleDownload();
  $('#imageUpscaleResultArea').innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-mark">＋</div>' +
      '<strong>准备生成图片</strong>' +
      '<span>输入提示词并选择画幅，生成结果会显示在这里。</span>' +
    '</div>';
}

function renderImageUpscaleLoading(status, taskId) {
  setImageUpscaleStatus(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  setImageUpscaleDownload();
  $('#imageUpscaleResultArea').innerHTML =
    '<div class="loading-state">' +
      '<div class="loading-mark"></div>' +
      '<strong>' + (status === 'QUEUED' ? '任务正在排队' : '图片正在生成') + '</strong>' +
      '<span>状态每 3 秒自动刷新。</span>' +
    '</div>';
}

function renderImageUpscaleSuccess(task) {
  const results = Array.isArray(task?.results) ? task.results : [];
  const images = results.filter(isImage);
  const primary = images[0] || results[0];

  setImageUpscaleStatus('SUCCESS', task?.taskId ? ('TASK · ' + task.taskId) : 'DONE');

  if (!primary) {
    setImageUpscaleDownload();
    $('#imageUpscaleResultArea').innerHTML =
      '<div class="empty-state"><div class="empty-mark">✓</div><strong>任务完成</strong><span>没有返回可预览图片。</span></div>';
    return;
  }

  const url = primary.url || '';
  const type = String(primary.outputType || 'png').toLowerCase();
  setImageUpscaleDownload(url, type);

  if (images.length > 1) {
    $('#imageUpscaleResultArea').innerHTML =
      '<div class="image-result-grid">' +
        images.map(item => generatedImageTag(item.url || '')).join('') +
      '</div>';
    bindGeneratedImageFallbacks($('#imageUpscaleResultArea'));
  } else if (url) {
    $('#imageUpscaleResultArea').innerHTML = generatedImageTag(url);
    bindGeneratedImageFallbacks($('#imageUpscaleResultArea'));
  } else if (primary.text) {
    $('#imageUpscaleResultArea').innerHTML = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  }
}

function renderImageUpscaleFailed(task, message) {
  setImageUpscaleStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');
  setImageUpscaleDownload();
  $('#imageUpscaleResultArea').innerHTML = failureHtml(task, message);
}

function getImageUpscaleNodes(prompt) {
  return [
    {nodeId:'49',fieldName:'aspect_ratio',fieldValue:$('#imageUpscaleAspectRatio').value,description:null},
    {nodeId:'49',fieldName:'megapixels',fieldValue:'2',description:null},
    {nodeId:'63',fieldName:'value',fieldValue:prompt,description:null},
    {nodeId:'95',fieldName:'scale_by',fieldValue:'1.5',description:null},
    {nodeId:'53',fieldName:'cfg',fieldValue:'1',description:null},
    {nodeId:'53',fieldName:'denoise',fieldValue:'1',description:null},
    {nodeId:'53',fieldName:'sampler_name',fieldValue:'euler_ancestral',description:null},
    {nodeId:'53',fieldName:'scheduler',fieldValue:'sgm_uniform',description:null},
    {nodeId:'53',fieldName:'steps',fieldValue:'8',description:null}
  ];
}

async function runImageUpscaleTask() {
  if (imageUpscaleState.running) return;

  if (!apiKey()) {
    toast('请先在设置中保存 RunningHub API Key','bad');
    openSettings();
    return;
  }

  const prompt = $('#imageUpscalePromptInput').value.trim();
  if (!prompt) {
    toast('请输入图片提示词','bad');
    $('#imageUpscalePromptInput').focus();
    return;
  }

  imageUpscaleState.running = true;
  $('#imageUpscaleRunBtn').disabled = true;
  $('.image-upscale-generate-label').textContent = '提交任务…';
  setImageUpscaleDownload();
  setImageUpscaleStatus('SUBMITTING','RUNNINGHUB');

  try {
    const data = await runRHApp(APPS[APP_KEYS.imageUpscale].appId, getImageUpscaleNodes(prompt));
    imageUpscaleState.task = data;

    upsertHistory(APP_KEYS.imageUpscale, data, {
      createdAt:Date.now(),
      aspect:($('#imageUpscaleAspectRatio').value || '').split(' ')[0],
      quality:'2MP · 1.5×',
      duration:'',
      instance:instanceLabel($('#instanceType').value),
      prompt:prompt.slice(0,120)
    });

    toast('图片生成任务已提交','good');

    if (data.status === 'SUCCESS') {
      renderImageUpscaleSuccess(data);
    } else if (data.status === 'FAILED') {
      renderImageUpscaleFailed(data);
    } else {
      renderImageUpscaleLoading(data.status || 'RUNNING', data.taskId);
      if (data.taskId) {
        clearInterval(imageUpscaleState.poll);
        imageUpscaleState.poll = setInterval(() => queryImageUpscaleTask(data.taskId), 3000);
      }
    }
  } catch (error) {
    renderImageUpscaleFailed(imageUpscaleState.task, error?.message || '运行失败');
    toast(error?.message || '运行失败','bad');
  } finally {
    imageUpscaleState.running = false;
    $('#imageUpscaleRunBtn').disabled = false;
    $('.image-upscale-generate-label').textContent = '开始生成';
  }
}

async function queryImageUpscaleTask(taskId) {
  try {
    const data = await queryRH(taskId);
    imageUpscaleState.task = data;
    const status = data.status || 'RUNNING';

    upsertHistory(APP_KEYS.imageUpscale, data, {taskId});

    if (status === 'SUCCESS') {
      clearInterval(imageUpscaleState.poll);
      imageUpscaleState.poll = null;
      renderImageUpscaleSuccess(data);
      toast('图片生成完成','good');
    } else if (status === 'FAILED') {
      clearInterval(imageUpscaleState.poll);
      imageUpscaleState.poll = null;
      renderImageUpscaleFailed(data);
      toast('图片生成失败','bad');
    } else {
      renderImageUpscaleLoading(status, data.taskId || taskId);
    }
  } catch (error) {
    clearInterval(imageUpscaleState.poll);
    imageUpscaleState.poll = null;
    renderImageUpscaleFailed(imageUpscaleState.task, error?.message || '任务查询失败');
    toast(error?.message || '任务查询失败','bad');
  }
}

function triggerDownload(outputState, button, prefix) {
  if (!outputState.outputUrl) return;

  const original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<span>下载中</span><b>↓</b>';

  try {
    const ext = (outputState.outputType || 'bin').replace(/[^a-z0-9]/gi,'') || 'bin';
    const a = document.createElement('a');
    a.href = outputState.outputUrl;
    a.download = prefix + '.' + ext;
    a.rel = 'noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('已开始下载','good');
  } catch {
    const fallback = outputState.outputSourceUrl || outputState.outputUrl;
    window.open(fallback, '_blank', 'noopener,noreferrer');
    toast('下载失败，已打开原文件','bad');
  } finally {
    setTimeout(() => {
      button.disabled = !outputState.outputUrl;
      button.innerHTML = original;
    }, 450);
  }
}

$('#runBtn').onclick = runVideoTask;
$('#downloadBtn').onclick = () => triggerDownload(videoState, $('#downloadBtn'), 'rh-studio-video');
$('#imageRunBtn').onclick = runImageTask;
$('#imageDownloadBtn').onclick = () => triggerDownload(imageState, $('#imageDownloadBtn'), 'rh-studio-image');
$('#imageUpscaleRunBtn').onclick = runImageUpscaleTask;
$('#imageUpscaleDownloadBtn').onclick = () => triggerDownload(imageUpscaleState, $('#imageUpscaleDownloadBtn'), 'rh-studio-image-upscale');

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
  [
    LS.active,
    LS.prompt,
    LS.aspect,
    LS.quality,
    LS.duration,
    LS.imagePrompt,
    LS.imageAspect,
    LS.imageUpscalePrompt,
    LS.imageUpscaleAspect,
    LS.inst
  ].forEach(k => localStorage.removeItem(k));

  Object.keys(state.files).forEach(slot => clearFile(slot));
  loadConfig();
  renderVideoIdle();
  renderImageIdle();
  renderImageUpscaleIdle();
  setActiveApp(APP_KEYS.video);
  toast('本地应用配置已重置');
};

loadConfig();
updateKeyUI();
Object.keys(MEDIA).forEach(renderFileSlot);
renderVideoIdle();
renderImageIdle();
renderImageUpscaleIdle();

const params = new URLSearchParams(window.location.search);
const requestedApp = params.get('app');
const recoveryTaskId = params.get('task');
const initialApp = APPS[requestedApp]
  ? requestedApp
  : (APPS[localStorage.getItem(LS.active)] ? localStorage.getItem(LS.active) : APP_KEYS.video);

setActiveApp(initialApp, false);

if (recoveryTaskId) {
  if (!apiKey()) {
    toast('请先在设置中保存 API Key，再恢复任务', 'bad');
  } else if (initialApp === APP_KEYS.image) {
    renderImageLoading('RUNNING', recoveryTaskId);
    queryImageTask(recoveryTaskId);
  } else if (initialApp === APP_KEYS.imageUpscale) {
    renderImageUpscaleLoading('RUNNING', recoveryTaskId);
    queryImageUpscaleTask(recoveryTaskId);
  } else {
    renderVideoLoading('RUNNING', recoveryTaskId);
    queryVideoTask(recoveryTaskId);
  }
}
