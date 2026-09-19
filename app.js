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
    name: '超强文生图V3.0 基础版',
    subtitle: '纯文本生成',
    title: '超强文生图V3.0 基础版',
    type: 'image'
  },
  'krea2-white-marble': {
    key: 'krea2-white-marble',
    appId: '2083580194556071937',
    name: 'Krea2 turbo White_Marble-AIO（Portrait Master）',
    subtitle: 'Portrait Master',
    title: 'Krea2 turbo White_Marble-AIO（Portrait Master）',
    type: 'image'
  },
  'kq12-portrait': {
    key: 'kq12-portrait',
    appId: '2074694253623726082',
    name: 'KQ12Z真实人像-超绝美感文生图',
    subtitle: 'Prompt Only',
    title: 'KQ12Z真实人像-超绝美感文生图',
    type: 'image'
  },
  'face-t2i-v3': {
    key: 'face-t2i-v3',
    appId: '2081918043782344705',
    name: '指定人脸文生图V3 -(Qwen/Krea2)双版本',
    subtitle: 'Face Guided',
    title: '指定人脸文生图V3 -(Qwen/Krea2)双版本',
    type: 'image'
  },
  'skin-upscale': {
    key: 'skin-upscale',
    appId: '2050826078431793153',
    name: '去AI感真实皮肤高清放大',
    subtitle: 'Image Enhance',
    title: '去AI感真实皮肤高清放大',
    type: 'image'
  },
  'minimax-h3-multi-fast': {
    key: 'minimax-h3-multi-fast',
    appId: '2086022574387339266',
    name: 'MinimaxH3多图生视频 (加速版)',
    subtitle: '加速版',
    title: 'MinimaxH3多图生视频 (加速版)',
    type: 'video'
  }
};

const APP_KEYS = {
  video: 'minimax-h3',
  image: 'image-2mp',
  whiteMarble: 'krea2-white-marble',
  kq12Portrait: 'kq12-portrait',
  faceT2I: 'face-t2i-v3',
  skinUpscale: 'skin-upscale',
  multiFast: 'minimax-h3-multi-fast'
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
  whiteMarblePrompt: 'rhstudio.whiteMarble.prompt',
  whiteMarbleWidth: 'rhstudio.whiteMarble.width',
  whiteMarbleHeight: 'rhstudio.whiteMarble.height',
  whiteMarbleSeed: 'rhstudio.whiteMarble.seed',
  kq12Prompt: 'rhstudio.kq12.prompt',
  faceT2IPrompt: 'rhstudio.faceT2I.prompt',
  faceT2IModelBranch: 'rhstudio.faceT2I.modelBranch',
  faceT2IAspect: 'rhstudio.faceT2I.aspect',
  faceT2IHD: 'rhstudio.faceT2I.hd',
  multiFastPrompt: 'rhstudio.multiFast.prompt',
  multiFastAspect: 'rhstudio.multiFast.aspect',
  appFilter: 'rhstudio.appFilter',
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

const MULTI_FAST_MEDIA = {
  mfastImg141: { nodeId:'141', fieldName:'image', kind:'image', label:'参考图 1', order:1 },
  mfastImg142: { nodeId:'142', fieldName:'image', kind:'image', label:'参考图 2', order:2 },
  mfastImg143: { nodeId:'143', fieldName:'image', kind:'image', label:'参考图 3', order:3 },
  mfastImg161: { nodeId:'161', fieldName:'image', kind:'image', label:'参考图 4', order:4 },
  mfastImg165: { nodeId:'165', fieldName:'image', kind:'image', label:'参考图 5', order:5 },
  mfastImg166: { nodeId:'166', fieldName:'image', kind:'image', label:'参考图 6', order:6 },
  mfastAudio144: { nodeId:'144', fieldName:'audio', kind:'audio', label:'音频 1' },
  mfastAudio160: { nodeId:'160', fieldName:'audio', kind:'audio', label:'音频 2' },
  mfastVideo164: { nodeId:'164', fieldName:'video', kind:'video', label:'参考视频', subtitle:'可选视频参考' }
};

const state = {
  activeApp: APP_KEYS.video,
  appFilter: 'all',
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

const whiteMarbleState = {
  task: null,
  poll: null,
  running: false,
  outputUrl: '',
  outputSourceUrl: '',
  outputType: ''
};

const kq12State = {
  task: null,
  poll: null,
  running: false,
  outputUrl: '',
  outputSourceUrl: '',
  outputType: ''
};

const faceT2IState = {
  task: null,
  poll: null,
  running: false,
  outputUrl: '',
  outputSourceUrl: '',
  outputType: '',
  faceFile: null,
  faceObjectUrl: ''
};

const skinUpscaleState = {
  task: null,
  poll: null,
  running: false,
  outputUrl: '',
  outputSourceUrl: '',
  outputType: '',
  inputFile: null,
  inputObjectUrl: ''
};

const multiFastState = {
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
  $('#workspaceWhiteMarble').classList.toggle('hidden', key !== APP_KEYS.whiteMarble);
  $('#workspaceKQ12').classList.toggle('hidden', key !== APP_KEYS.kq12Portrait);
  $('#workspaceFaceT2I').classList.toggle('hidden', key !== APP_KEYS.faceT2I);
  $('#workspaceSkinUpscale').classList.toggle('hidden', key !== APP_KEYS.skinUpscale);
  $('#workspaceMultiFast').classList.toggle('hidden', key !== APP_KEYS.multiFast);

  const app = APPS[key];
  $('#currentAppTitle').textContent = app.title;
  $('#settingsCurrentApp').textContent = app.title;

  requestAnimationFrame(() => {
    const activeWorkspace = $('.app-workspace:not(.hidden)');
    activeWorkspace?.querySelectorAll('.image-preview-stage > img.generated-image').forEach(fitGeneratedImageToStage);
  });

  if (persist) localStorage.setItem(LS.active, key);
}

function renderAppFilter(filter='all', persist=true, autoSelect=true) {
  const validFilters = new Set(['all','image','video','text']);
  if (!validFilters.has(filter)) filter = 'all';
  state.appFilter = filter;

  const counts = {all:0,image:0,video:0,text:0};
  Object.values(APPS).forEach(app => {
    counts.all += 1;
    if (counts[app.type] != null) counts[app.type] += 1;
  });

  const countEls = {
    all:$('#appFilterCountAll'),
    image:$('#appFilterCountImage'),
    video:$('#appFilterCountVideo'),
    text:$('#appFilterCountText')
  };
  Object.entries(countEls).forEach(([key,el]) => {
    if (el) el.textContent = String(counts[key] || 0);
  });

  const visibleItems = [];
  $$('.app-item').forEach(item => {
    const app = APPS[item.dataset.app];
    const visible = filter === 'all' || app?.type === filter;
    item.classList.toggle('filter-hidden', !visible);
    if (visible) visibleItems.push(item);
  });

  $$('.app-filter-btn').forEach(button => {
    const active = button.dataset.appFilter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const empty = $('#appFilterEmpty');
  if (empty) {
    const labels = {image:'图片',video:'视频',text:'文字',all:'全部'};
    empty.classList.toggle('hidden', visibleItems.length > 0);
    const strong = empty.querySelector('strong');
    const span = empty.querySelector('span');
    if (strong) strong.textContent = visibleItems.length ? '' : '暂无' + labels[filter] + '应用';
    if (span) span.textContent = visibleItems.length ? '' : '这个分类还没有接入应用。';
  }

  if (autoSelect && filter !== 'all') {
    const activeApp = APPS[state.activeApp];
    if (activeApp?.type !== filter && visibleItems.length) {
      setActiveApp(visibleItems[0].dataset.app);
    }
  }

  if (persist) localStorage.setItem(LS.appFilter, filter);
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

function persistWhiteMarbleConfig() {
  localStorage.setItem(LS.whiteMarblePrompt, $('#whiteMarblePromptInput').value);
  localStorage.setItem(LS.whiteMarbleWidth, $('#whiteMarbleWidth').value.trim());
  localStorage.setItem(LS.whiteMarbleHeight, $('#whiteMarbleHeight').value.trim());
  localStorage.setItem(LS.whiteMarbleSeed, $('#whiteMarbleSeed').value.trim());
}

function persistKQ12Config() {
  localStorage.setItem(LS.kq12Prompt, $('#kq12PromptInput').value);
}

function persistFaceT2IConfig() {
  localStorage.setItem(LS.faceT2IPrompt, $('#faceT2IPromptInput').value);
  localStorage.setItem(LS.faceT2IModelBranch, $('#faceT2IModelBranch').value);
  localStorage.setItem(LS.faceT2IAspect, $('#faceT2IAspectRatio').value);
  localStorage.setItem(LS.faceT2IHD, $('#faceT2IHD').value);
}

function persistMultiFastConfig() {
  localStorage.setItem(LS.multiFastPrompt, $('#multiFastPromptInput').value);
  localStorage.setItem(LS.multiFastAspect, $('#multiFastAspectRatio').value);
}

function loadConfig() {
  // One-time cleanup for removed Claire app settings.
  localStorage.removeItem('rhstudio.image2mpUpscale.prompt');
  localStorage.removeItem('rhstudio.image2mpUpscale.aspectRatio');
  $('#promptInput').value = localStorage.getItem(LS.prompt) || '';
  $('#aspectRatio').value = localStorage.getItem(LS.aspect) || '9:16 (Portrait Widescreen)';
  $('#qualityPreset').value = localStorage.getItem(LS.quality) || '0.9';

  const savedDuration = Number(localStorage.getItem(LS.duration) || 10);
  const normalizedDuration = Math.min(15, Math.max(5, Number.isFinite(savedDuration) ? savedDuration : 10));
  $('#durationRange').value = String(normalizedDuration);
  localStorage.setItem(LS.duration, String(normalizedDuration));

  $('#imagePromptInput').value = localStorage.getItem(LS.imagePrompt) || '';
  $('#imageAspectRatio').value = localStorage.getItem(LS.imageAspect) || '9:16 (Portrait Widescreen)';
  $('#whiteMarblePromptInput').value = localStorage.getItem(LS.whiteMarblePrompt) || '';
  $('#whiteMarbleWidth').value = localStorage.getItem(LS.whiteMarbleWidth) || '1080';
  $('#whiteMarbleHeight').value = localStorage.getItem(LS.whiteMarbleHeight) || '1920';
  $('#whiteMarbleSeed').value = localStorage.getItem(LS.whiteMarbleSeed) || '527633149753192';
  $('#kq12PromptInput').value = localStorage.getItem(LS.kq12Prompt) || '';
  $('#faceT2IPromptInput').value = localStorage.getItem(LS.faceT2IPrompt) || '';
  $('#faceT2IModelBranch').value = localStorage.getItem(LS.faceT2IModelBranch) || 'true';
  $('#faceT2IAspectRatio').value = localStorage.getItem(LS.faceT2IAspect) || '9:16';
  $('#faceT2IHD').value = localStorage.getItem(LS.faceT2IHD) || 'false';
  $('#multiFastPromptInput').value = localStorage.getItem(LS.multiFastPrompt) || '';
  $('#multiFastAspectRatio').value = localStorage.getItem(LS.multiFastAspect) || '9:16 (Portrait Widescreen)';
  state.appFilter = localStorage.getItem(LS.appFilter) || 'all';
  $('#instanceType').value = localStorage.getItem(LS.inst) || 'default';

  updateDurationUI();
  updatePromptCount();
  updateImagePromptCount();
  updateWhiteMarblePromptCount();
  updateKQ12PromptCount();
  updateFaceT2IPromptCount();
  updateMultiFastPromptCount();
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

function updateWhiteMarblePromptCount() {
  $('#whiteMarblePromptCount').textContent = String($('#whiteMarblePromptInput').value.length);
}

function updateKQ12PromptCount() {
  $('#kq12PromptCount').textContent = String($('#kq12PromptInput').value.length);
}

function updateFaceT2IPromptCount() {
  $('#faceT2IPromptCount').textContent = String($('#faceT2IPromptInput').value.length);
}

function updateMultiFastPromptCount() {
  $('#multiFastPromptCount').textContent = String($('#multiFastPromptInput').value.length);
}

function aspectLabelFromDimensions(width, height) {
  const w = Math.max(1, Math.round(Number(width) || 1));
  const h = Math.max(1, Math.round(Number(height) || 1));
  const gcd = (a,b) => b ? gcd(b, a % b) : a;
  const d = gcd(w,h);
  return (w / d) + ':' + (h / d);
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

['whiteMarblePromptInput','whiteMarbleWidth','whiteMarbleHeight','whiteMarbleSeed'].forEach(id => {
  const el = $('#' + id);
  el.addEventListener('input', () => {
    persistWhiteMarbleConfig();
    if (id === 'whiteMarblePromptInput') updateWhiteMarblePromptCount();
  });
  el.addEventListener('change', persistWhiteMarbleConfig);
});

$('#kq12PromptInput').addEventListener('input', () => {
  persistKQ12Config();
  updateKQ12PromptCount();
});
$('#kq12PromptInput').addEventListener('change', persistKQ12Config);

['faceT2IPromptInput','faceT2IModelBranch','faceT2IAspectRatio','faceT2IHD'].forEach(id => {
  const el = $('#' + id);
  el.addEventListener('input', () => {
    persistFaceT2IConfig();
    if (id === 'faceT2IPromptInput') updateFaceT2IPromptCount();
  });
  el.addEventListener('change', persistFaceT2IConfig);
});

['multiFastPromptInput','multiFastAspectRatio'].forEach(id => {
  const el = $('#' + id);
  el.addEventListener('input', () => {
    persistMultiFastConfig();
    if (id === 'multiFastPromptInput') updateMultiFastPromptCount();
  });
  el.addEventListener('change', persistMultiFastConfig);
});

$('#instanceType').addEventListener('change', () => {
  localStorage.setItem(LS.inst, $('#instanceType').value);
});

$$('.app-item').forEach(item => {
  item.addEventListener('click', () => setActiveApp(item.dataset.app));
});

$$('.app-filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    renderAppFilter(button.dataset.appFilter || 'all');
  });
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
  const config = MEDIA[slot] || MULTI_FAST_MEDIA[slot];
  if (!config) return;
  const file = state.files[slot];
  const el = $('.upload-slot[data-slot="' + slot + '"]');
  if (!el) return;

  el.classList.toggle('has-file', !!file);
  el.querySelector('.slot-clear')?.classList.toggle('hidden', !file);

  if (config.kind === 'image') {
    const preview = el.querySelector('.media-preview');
    const caption = el.querySelector('.media-caption strong');
    const index = config.order || (['img141','img142','img143','img161','img175','img176'].indexOf(slot) + 1);

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
      title.textContent = config.label || '参考视频';
      subtitle.textContent = config.subtitle || '支持上传本地视频作为结构 / 动作 / 镜头参考';
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

function clearFaceT2IFile() {
  if (faceT2IState.faceObjectUrl) {
    URL.revokeObjectURL(faceT2IState.faceObjectUrl);
    faceT2IState.faceObjectUrl = '';
  }
  faceT2IState.faceFile = null;
  const input = $('#faceT2IFileInput');
  if (input) input.value = '';
  renderFaceT2IInput();
}

function setFaceT2IFile(file) {
  if (!file) return;
  if (file.size > MAX_RH_UPLOAD_BYTES) {
    toast('人脸参考图不能超过 30MB','bad');
    return;
  }

  if (faceT2IState.faceObjectUrl) {
    URL.revokeObjectURL(faceT2IState.faceObjectUrl);
  }

  faceT2IState.faceFile = file;
  faceT2IState.faceObjectUrl = URL.createObjectURL(file);
  renderFaceT2IInput();
}

function renderFaceT2IInput() {
  const preview = $('#faceT2IPreview');
  const fileName = $('#faceT2IFileName');
  const clear = $('#faceT2IClear');
  if (!preview || !fileName || !clear) return;

  const file = faceT2IState.faceFile;
  if (file && faceT2IState.faceObjectUrl) {
    preview.innerHTML = '<img src="' + esc(faceT2IState.faceObjectUrl) + '" alt="face reference">';
    fileName.textContent = file.name;
    clear.classList.remove('hidden');
  } else {
    preview.innerHTML = '<span>FACE</span><i>＋</i>';
    fileName.textContent = '指定人脸参考图';
    clear.classList.add('hidden');
  }
}

$('#faceT2IUpload').addEventListener('click', e => {
  if (e.target.closest('#faceT2IClear')) {
    e.preventDefault();
    e.stopPropagation();
    clearFaceT2IFile();
    return;
  }
  $('#faceT2IFileInput').click();
});

$('#faceT2IFileInput').addEventListener('click', e => e.stopPropagation());
$('#faceT2IFileInput').addEventListener('change', e => {
  e.stopPropagation();
  const file = e.target.files?.[0];
  if (file) setFaceT2IFile(file);
});

function clearSkinUpscaleFile() {
  if (skinUpscaleState.inputObjectUrl) {
    URL.revokeObjectURL(skinUpscaleState.inputObjectUrl);
    skinUpscaleState.inputObjectUrl = '';
  }
  skinUpscaleState.inputFile = null;
  const input = $('#skinUpscaleFileInput');
  if (input) input.value = '';
  renderSkinUpscaleInput();
}

function setSkinUpscaleFile(file) {
  if (!file) return;
  if (file.size > MAX_RH_UPLOAD_BYTES) {
    toast('输入图片不能超过 30MB','bad');
    return;
  }

  if (skinUpscaleState.inputObjectUrl) {
    URL.revokeObjectURL(skinUpscaleState.inputObjectUrl);
  }

  skinUpscaleState.inputFile = file;
  skinUpscaleState.inputObjectUrl = URL.createObjectURL(file);
  renderSkinUpscaleInput();
}

function renderSkinUpscaleInput() {
  const preview = $('#skinUpscalePreview');
  const fileName = $('#skinUpscaleFileName');
  const clear = $('#skinUpscaleClear');
  if (!preview || !fileName || !clear) return;

  const file = skinUpscaleState.inputFile;
  if (file && skinUpscaleState.inputObjectUrl) {
    preview.innerHTML = '<img src="' + esc(skinUpscaleState.inputObjectUrl) + '" alt="input image">';
    fileName.textContent = file.name;
    clear.classList.remove('hidden');
  } else {
    preview.innerHTML = '<span>IMAGE</span><i>＋</i>';
    fileName.textContent = '上传需要高清放大的图片';
    clear.classList.add('hidden');
  }
}

$('#skinUpscaleUpload').addEventListener('click', e => {
  if (e.target.closest('#skinUpscaleClear')) {
    e.preventDefault();
    e.stopPropagation();
    clearSkinUpscaleFile();
    return;
  }
  $('#skinUpscaleFileInput').click();
});

$('#skinUpscaleFileInput').addEventListener('click', e => e.stopPropagation());
$('#skinUpscaleFileInput').addEventListener('change', e => {
  e.stopPropagation();
  const file = e.target.files?.[0];
  if (file) setSkinUpscaleFile(file);
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
  const classes = ['generated-image', className].filter(Boolean).join(' ');

  return '<img src="' + esc(direct) + '"' +
    (fallback ? ' data-fallback-src="' + esc(fallback) + '"' : '') +
    ' referrerpolicy="no-referrer"' +
    ' class="' + esc(classes) + '"' +
    ' alt="generated image">';
}

function fitGeneratedImageToStage(img) {
  const stage = img.closest('.image-preview-stage');
  if (!stage || img.closest('.image-result-grid')) return;

  const naturalWidth = Number(img.naturalWidth || 0);
  const naturalHeight = Number(img.naturalHeight || 0);
  const stageWidth = Number(stage.clientWidth || 0);
  const stageHeight = Number(stage.clientHeight || 0);

  if (!naturalWidth || !naturalHeight || !stageWidth || !stageHeight) return;

  const scale = Math.min(stageWidth / naturalWidth, stageHeight / naturalHeight);
  const width = Math.max(1, Math.floor(naturalWidth * scale));
  const height = Math.max(1, Math.floor(naturalHeight * scale));

  img.style.width = width + 'px';
  img.style.height = height + 'px';
}

function bindGeneratedImageFallbacks(root) {
  if (!root) return;

  root.querySelectorAll('img.generated-image').forEach(img => {
    img.addEventListener('load', () => fitGeneratedImageToStage(img));

    img.addEventListener('error', () => {
      if (!img.dataset.fallbackTried && img.dataset.fallbackSrc) {
        img.dataset.fallbackTried = '1';
        img.src = img.dataset.fallbackSrc;
        return;
      }

      img.closest('.image-result-grid')?.classList.add('has-load-error');
      img.closest('.image-preview-stage')?.classList.add('has-load-error');
      toast('图片已生成，但预览加载失败', 'bad');
    });

    if (img.complete && img.naturalWidth) fitGeneratedImageToStage(img);
  });
}

function refitAllGeneratedImagePreviews() {
  $$('.image-preview-stage > img.generated-image').forEach(fitGeneratedImageToStage);
}

window.addEventListener('resize', refitAllGeneratedImagePreviews);

if ('ResizeObserver' in window) {
  const imagePreviewResizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      entry.target.querySelectorAll('img.generated-image').forEach(fitGeneratedImageToStage);
    });
  });
  $$('.image-preview-stage').forEach(stage => imagePreviewResizeObserver.observe(stage));
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
    const selectedFiles = Object.entries(state.files).filter(([slot]) => !!MEDIA[slot]);
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

function setWhiteMarbleStatus(status, meta='') {
  const names = {
    IDLE:'等待生成',
    SUBMITTING:'提交任务',
    QUEUED:'排队中',
    RUNNING:'生成中',
    SUCCESS:'生成完成',
    FAILED:'生成失败'
  };

  statusClass($('#whiteMarbleStatusDot'), status);
  $('#whiteMarbleStatusText').textContent = names[status] || status;
  $('#whiteMarbleTaskMeta').textContent = meta || 'READY';
}

function setWhiteMarbleDownload(url='', type='') {
  whiteMarbleState.outputSourceUrl = url || '';
  whiteMarbleState.outputUrl = toMediaUrl(url || '');
  whiteMarbleState.outputType = type || '';
  $('#whiteMarbleDownloadBtn').disabled = !whiteMarbleState.outputUrl;
}

function renderWhiteMarbleIdle() {
  setWhiteMarbleStatus('IDLE','READY');
  setWhiteMarbleDownload();
  $('#whiteMarbleResultArea').innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-mark">＋</div>' +
      '<strong>准备生成肖像</strong>' +
      '<span>输入提示词并设置输出尺寸，生成结果会显示在这里。</span>' +
    '</div>';
}

function renderWhiteMarbleLoading(status, taskId) {
  setWhiteMarbleStatus(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  setWhiteMarbleDownload();
  $('#whiteMarbleResultArea').innerHTML =
    '<div class="loading-state">' +
      '<div class="loading-mark"></div>' +
      '<strong>' + (status === 'QUEUED' ? '任务正在排队' : '图片正在生成') + '</strong>' +
      '<span>状态每 3 秒自动刷新。</span>' +
    '</div>';
}

function renderWhiteMarbleSuccess(task) {
  const results = Array.isArray(task?.results) ? task.results : [];
  const images = results.filter(isImage);
  const primary = images[0] || results[0];

  setWhiteMarbleStatus('SUCCESS', task?.taskId ? ('TASK · ' + task.taskId) : 'DONE');

  if (!primary) {
    setWhiteMarbleDownload();
    $('#whiteMarbleResultArea').innerHTML =
      '<div class="empty-state"><div class="empty-mark">✓</div><strong>任务完成</strong><span>没有返回可预览图片。</span></div>';
    return;
  }

  const url = primary.url || '';
  const type = String(primary.outputType || 'png').toLowerCase();
  setWhiteMarbleDownload(url, type);

  if (images.length > 1) {
    $('#whiteMarbleResultArea').innerHTML =
      '<div class="image-result-grid">' +
        images.map(item => generatedImageTag(item.url || '')).join('') +
      '</div>';
    bindGeneratedImageFallbacks($('#whiteMarbleResultArea'));
  } else if (url) {
    $('#whiteMarbleResultArea').innerHTML = generatedImageTag(url);
    bindGeneratedImageFallbacks($('#whiteMarbleResultArea'));
  } else if (primary.text) {
    $('#whiteMarbleResultArea').innerHTML = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  }
}

function renderWhiteMarbleFailed(task, message) {
  setWhiteMarbleStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');
  setWhiteMarbleDownload();
  $('#whiteMarbleResultArea').innerHTML = failureHtml(task, message);
}

function getWhiteMarbleNodes(prompt, width, height, seed) {
  return [
    {nodeId:'7',fieldName:'width',fieldValue:String(width),description:null},
    {nodeId:'7',fieldName:'height',fieldValue:String(height),description:null},
    {nodeId:'6',fieldName:'seed',fieldValue:String(seed),description:null},
    {nodeId:'7',fieldName:'batch_size',fieldValue:'1',description:null},
    {nodeId:'5',fieldName:'text',fieldValue:prompt,description:null}
  ];
}

async function runWhiteMarbleTask() {
  if (whiteMarbleState.running) return;

  if (!apiKey()) {
    toast('请先在设置中保存 RunningHub API Key','bad');
    openSettings();
    return;
  }

  const prompt = $('#whiteMarblePromptInput').value.trim();
  const width = $('#whiteMarbleWidth').value.trim();
  const height = $('#whiteMarbleHeight').value.trim();
  const seed = $('#whiteMarbleSeed').value.trim();

  if (!prompt) {
    toast('请输入图片提示词','bad');
    $('#whiteMarblePromptInput').focus();
    return;
  }
  if (!/^\d+$/.test(width) || Number(width) <= 0) {
    toast('Width 必须是正整数','bad');
    $('#whiteMarbleWidth').focus();
    return;
  }
  if (!/^\d+$/.test(height) || Number(height) <= 0) {
    toast('Height 必须是正整数','bad');
    $('#whiteMarbleHeight').focus();
    return;
  }
  if (!/^\d+$/.test(seed)) {
    toast('Seed 必须是整数','bad');
    $('#whiteMarbleSeed').focus();
    return;
  }

  whiteMarbleState.running = true;
  $('#whiteMarbleRunBtn').disabled = true;
  $('.white-marble-generate-label').textContent = '提交任务…';
  setWhiteMarbleDownload();
  setWhiteMarbleStatus('SUBMITTING','RUNNINGHUB');

  try {
    const data = await runRHApp(
      APPS[APP_KEYS.whiteMarble].appId,
      getWhiteMarbleNodes(prompt, width, height, seed)
    );
    whiteMarbleState.task = data;

    upsertHistory(APP_KEYS.whiteMarble, data, {
      createdAt:Date.now(),
      aspect:aspectLabelFromDimensions(width, height),
      quality:width + '×' + height,
      duration:'',
      instance:instanceLabel($('#instanceType').value),
      prompt:prompt.slice(0,120)
    });

    toast('图片生成任务已提交','good');

    if (data.status === 'SUCCESS') {
      renderWhiteMarbleSuccess(data);
    } else if (data.status === 'FAILED') {
      renderWhiteMarbleFailed(data);
    } else {
      renderWhiteMarbleLoading(data.status || 'RUNNING', data.taskId);
      if (data.taskId) {
        clearInterval(whiteMarbleState.poll);
        whiteMarbleState.poll = setInterval(() => queryWhiteMarbleTask(data.taskId), 3000);
      }
    }
  } catch (error) {
    renderWhiteMarbleFailed(whiteMarbleState.task, error?.message || '运行失败');
    toast(error?.message || '运行失败','bad');
  } finally {
    whiteMarbleState.running = false;
    $('#whiteMarbleRunBtn').disabled = false;
    $('.white-marble-generate-label').textContent = '开始生成';
  }
}

async function queryWhiteMarbleTask(taskId) {
  try {
    const data = await queryRH(taskId);
    whiteMarbleState.task = data;
    const status = data.status || 'RUNNING';

    upsertHistory(APP_KEYS.whiteMarble, data, {taskId});

    if (status === 'SUCCESS') {
      clearInterval(whiteMarbleState.poll);
      whiteMarbleState.poll = null;
      renderWhiteMarbleSuccess(data);
      toast('图片生成完成','good');
    } else if (status === 'FAILED') {
      clearInterval(whiteMarbleState.poll);
      whiteMarbleState.poll = null;
      renderWhiteMarbleFailed(data);
      toast('图片生成失败','bad');
    } else {
      renderWhiteMarbleLoading(status, data.taskId || taskId);
    }
  } catch (error) {
    clearInterval(whiteMarbleState.poll);
    whiteMarbleState.poll = null;
    renderWhiteMarbleFailed(whiteMarbleState.task, error?.message || '任务查询失败');
    toast(error?.message || '任务查询失败','bad');
  }
}

function setKQ12Status(status, meta='') {
  const names = {
    IDLE:'等待生成',
    SUBMITTING:'提交任务',
    QUEUED:'排队中',
    RUNNING:'生成中',
    SUCCESS:'生成完成',
    FAILED:'生成失败'
  };

  statusClass($('#kq12StatusDot'), status);
  $('#kq12StatusText').textContent = names[status] || status;
  $('#kq12TaskMeta').textContent = meta || 'READY';
}

function setKQ12Download(url='', type='') {
  kq12State.outputSourceUrl = url || '';
  kq12State.outputUrl = toMediaUrl(url || '');
  kq12State.outputType = type || '';
  $('#kq12DownloadBtn').disabled = !kq12State.outputUrl;
}

function renderKQ12Idle() {
  setKQ12Status('IDLE','READY');
  setKQ12Download();
  $('#kq12ResultArea').innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-mark">＋</div>' +
      '<strong>准备生成图片</strong>' +
      '<span>输入提示词后即可开始生成。</span>' +
    '</div>';
}

function renderKQ12Loading(status, taskId) {
  setKQ12Status(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  setKQ12Download();
  $('#kq12ResultArea').innerHTML =
    '<div class="loading-state">' +
      '<div class="loading-mark"></div>' +
      '<strong>' + (status === 'QUEUED' ? '任务正在排队' : '图片正在生成') + '</strong>' +
      '<span>状态每 3 秒自动刷新。</span>' +
    '</div>';
}

function renderKQ12Success(task) {
  const results = Array.isArray(task?.results) ? task.results : [];
  const images = results.filter(isImage);
  const primary = images[0] || results[0];

  setKQ12Status('SUCCESS', task?.taskId ? ('TASK · ' + task.taskId) : 'DONE');

  if (!primary) {
    setKQ12Download();
    $('#kq12ResultArea').innerHTML =
      '<div class="empty-state"><div class="empty-mark">✓</div><strong>任务完成</strong><span>没有返回可预览图片。</span></div>';
    return;
  }

  const url = primary.url || '';
  const type = String(primary.outputType || 'png').toLowerCase();
  setKQ12Download(url, type);

  if (images.length > 1) {
    $('#kq12ResultArea').innerHTML =
      '<div class="image-result-grid">' +
        images.map(item => generatedImageTag(item.url || '')).join('') +
      '</div>';
    bindGeneratedImageFallbacks($('#kq12ResultArea'));
  } else if (url) {
    $('#kq12ResultArea').innerHTML = generatedImageTag(url);
    bindGeneratedImageFallbacks($('#kq12ResultArea'));
  } else if (primary.text) {
    $('#kq12ResultArea').innerHTML = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  }
}

function renderKQ12Failed(task, message) {
  setKQ12Status('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');
  setKQ12Download();
  $('#kq12ResultArea').innerHTML = failureHtml(task, message);
}

function getKQ12Nodes(prompt) {
  return [
    {nodeId:'216',fieldName:'text',fieldValue:prompt,description:'text'}
  ];
}

async function runKQ12Task() {
  if (kq12State.running) return;

  if (!apiKey()) {
    toast('请先在设置中保存 RunningHub API Key','bad');
    openSettings();
    return;
  }

  const prompt = $('#kq12PromptInput').value.trim();
  if (!prompt) {
    toast('请输入图片提示词','bad');
    $('#kq12PromptInput').focus();
    return;
  }

  kq12State.running = true;
  $('#kq12RunBtn').disabled = true;
  $('.kq12-generate-label').textContent = '提交任务…';
  setKQ12Download();
  setKQ12Status('SUBMITTING','RUNNINGHUB');

  try {
    const data = await runRHApp(APPS[APP_KEYS.kq12Portrait].appId, getKQ12Nodes(prompt));
    kq12State.task = data;

    upsertHistory(APP_KEYS.kq12Portrait, data, {
      createdAt:Date.now(),
      aspect:'',
      quality:'Prompt Only',
      duration:'',
      instance:instanceLabel($('#instanceType').value),
      prompt:prompt.slice(0,120)
    });

    toast('图片生成任务已提交','good');

    if (data.status === 'SUCCESS') {
      renderKQ12Success(data);
    } else if (data.status === 'FAILED') {
      renderKQ12Failed(data);
    } else {
      renderKQ12Loading(data.status || 'RUNNING', data.taskId);
      if (data.taskId) {
        clearInterval(kq12State.poll);
        kq12State.poll = setInterval(() => queryKQ12Task(data.taskId), 3000);
      }
    }
  } catch (error) {
    renderKQ12Failed(kq12State.task, error?.message || '运行失败');
    toast(error?.message || '运行失败','bad');
  } finally {
    kq12State.running = false;
    $('#kq12RunBtn').disabled = false;
    $('.kq12-generate-label').textContent = '开始生成';
  }
}

async function queryKQ12Task(taskId) {
  try {
    const data = await queryRH(taskId);
    kq12State.task = data;
    const status = data.status || 'RUNNING';

    upsertHistory(APP_KEYS.kq12Portrait, data, {taskId});

    if (status === 'SUCCESS') {
      clearInterval(kq12State.poll);
      kq12State.poll = null;
      renderKQ12Success(data);
      toast('图片生成完成','good');
    } else if (status === 'FAILED') {
      clearInterval(kq12State.poll);
      kq12State.poll = null;
      renderKQ12Failed(data);
      toast('图片生成失败','bad');
    } else {
      renderKQ12Loading(status, data.taskId || taskId);
    }
  } catch (error) {
    clearInterval(kq12State.poll);
    kq12State.poll = null;
    renderKQ12Failed(kq12State.task, error?.message || '任务查询失败');
    toast(error?.message || '任务查询失败','bad');
  }
}

function setFaceT2IStatus(status, meta='') {
  const names = {
    IDLE:'等待生成',
    UPLOADING:'上传人脸',
    SUBMITTING:'提交任务',
    QUEUED:'排队中',
    RUNNING:'生成中',
    SUCCESS:'生成完成',
    FAILED:'生成失败'
  };

  statusClass($('#faceT2IStatusDot'), status);
  $('#faceT2IStatusText').textContent = names[status] || status;
  $('#faceT2ITaskMeta').textContent = meta || 'READY';
}

function setFaceT2IDownload(url='', type='') {
  faceT2IState.outputSourceUrl = url || '';
  faceT2IState.outputUrl = toMediaUrl(url || '');
  faceT2IState.outputType = type || '';
  $('#faceT2IDownloadBtn').disabled = !faceT2IState.outputUrl;
}

function renderFaceT2IIdle() {
  setFaceT2IStatus('IDLE','READY');
  setFaceT2IDownload();
  $('#faceT2IResultArea').innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-mark">＋</div>' +
      '<strong>准备生成图片</strong>' +
      '<span>上传人脸参考图并输入提示词后开始生成。</span>' +
    '</div>';
}

function renderFaceT2ILoading(status, taskId) {
  setFaceT2IStatus(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  setFaceT2IDownload();
  $('#faceT2IResultArea').innerHTML =
    '<div class="loading-state">' +
      '<div class="loading-mark"></div>' +
      '<strong>' + (status === 'QUEUED' ? '任务正在排队' : status === 'UPLOADING' ? '正在上传人脸参考图' : '图片正在生成') + '</strong>' +
      '<span>' + (status === 'UPLOADING' ? '上传完成后会自动提交任务。' : '状态每 3 秒自动刷新。') + '</span>' +
    '</div>';
}

function renderFaceT2ISuccess(task) {
  const results = Array.isArray(task?.results) ? task.results : [];
  const images = results.filter(isImage);
  const primary = images[0] || results[0];

  setFaceT2IStatus('SUCCESS', task?.taskId ? ('TASK · ' + task.taskId) : 'DONE');

  if (!primary) {
    setFaceT2IDownload();
    $('#faceT2IResultArea').innerHTML =
      '<div class="empty-state"><div class="empty-mark">✓</div><strong>任务完成</strong><span>没有返回可预览图片。</span></div>';
    return;
  }

  const url = primary.url || '';
  const type = String(primary.outputType || 'png').toLowerCase();
  setFaceT2IDownload(url, type);

  if (images.length > 1) {
    $('#faceT2IResultArea').innerHTML =
      '<div class="image-result-grid">' +
        images.map(item => generatedImageTag(item.url || '')).join('') +
      '</div>';
    bindGeneratedImageFallbacks($('#faceT2IResultArea'));
  } else if (url) {
    $('#faceT2IResultArea').innerHTML = generatedImageTag(url);
    bindGeneratedImageFallbacks($('#faceT2IResultArea'));
  } else if (primary.text) {
    $('#faceT2IResultArea').innerHTML = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  }
}

function renderFaceT2IFailed(task, message) {
  setFaceT2IStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');
  setFaceT2IDownload();
  $('#faceT2IResultArea').innerHTML = failureHtml(task, message);
}

function getFaceT2INodes(faceValue, prompt) {
  return [
    {
      nodeId:'20',
      fieldName:'image',
      fieldValue:faceValue,
      description:'Face (preferably a large proportion)'
    },
    {
      nodeId:'13',
      fieldName:'text',
      fieldValue:prompt,
      description:'Prompt (limit words use @ to separate)'
    },
    {
      nodeId:'209',
      fieldName:'value',
      fieldValue:$('#faceT2IModelBranch').value || 'true',
      description:'Model <Qwen / Krea2>'
    },
    {
      nodeId:'84',
      fieldName:'aspect_ratio',
      fieldValue:$('#faceT2IAspectRatio').value || '9:16',
      description:'Output scale'
    },
    {
      nodeId:'206',
      fieldName:'value',
      fieldValue:$('#faceT2IHD').value || 'false',
      description:'HD'
    },
    {
      nodeId:'90',
      fieldName:'value',
      fieldValue:'false',
      description:'Output method <Direct output or ZIP>'
    }
  ];
}

async function runFaceT2ITask() {
  if (faceT2IState.running) return;

  if (!apiKey()) {
    toast('请先在设置中保存 RunningHub API Key','bad');
    openSettings();
    return;
  }

  const prompt = $('#faceT2IPromptInput').value.trim();
  if (!faceT2IState.faceFile) {
    toast('请先上传指定人脸参考图','bad');
    return;
  }
  if (!prompt) {
    toast('请输入图片提示词','bad');
    $('#faceT2IPromptInput').focus();
    return;
  }

  faceT2IState.running = true;
  $('#faceT2IRunBtn').disabled = true;
  $('.face-t2i-generate-label').textContent = '上传人脸…';
  setFaceT2IDownload();
  renderFaceT2ILoading('UPLOADING');

  try {
    const faceValue = await uploadFile(faceT2IState.faceFile, apiKey());

    setFaceT2IStatus('SUBMITTING','RUNNINGHUB');
    $('.face-t2i-generate-label').textContent = '提交任务…';

    const data = await runRHApp(
      APPS[APP_KEYS.faceT2I].appId,
      getFaceT2INodes(faceValue, prompt)
    );
    faceT2IState.task = data;

    const modelBranch = $('#faceT2IModelBranch').value || 'true';
    const hd = $('#faceT2IHD').value === 'true';

    upsertHistory(APP_KEYS.faceT2I, data, {
      createdAt:Date.now(),
      aspect:$('#faceT2IAspectRatio').value || '9:16',
      quality:(hd ? 'HD' : 'Standard') + ' · branch ' + modelBranch,
      duration:'',
      instance:instanceLabel($('#instanceType').value),
      prompt:prompt.slice(0,120)
    });

    toast('图片生成任务已提交','good');

    if (data.status === 'SUCCESS') {
      renderFaceT2ISuccess(data);
    } else if (data.status === 'FAILED') {
      renderFaceT2IFailed(data);
    } else {
      renderFaceT2ILoading(data.status || 'RUNNING', data.taskId);
      if (data.taskId) {
        clearInterval(faceT2IState.poll);
        faceT2IState.poll = setInterval(() => queryFaceT2ITask(data.taskId), 3000);
      }
    }
  } catch (error) {
    renderFaceT2IFailed(faceT2IState.task, error?.message || '运行失败');
    toast(error?.message || '运行失败','bad');
  } finally {
    faceT2IState.running = false;
    $('#faceT2IRunBtn').disabled = false;
    $('.face-t2i-generate-label').textContent = '开始生成';
  }
}

async function queryFaceT2ITask(taskId) {
  try {
    const data = await queryRH(taskId);
    faceT2IState.task = data;
    const status = data.status || 'RUNNING';

    upsertHistory(APP_KEYS.faceT2I, data, {taskId});

    if (status === 'SUCCESS') {
      clearInterval(faceT2IState.poll);
      faceT2IState.poll = null;
      renderFaceT2ISuccess(data);
      toast('图片生成完成','good');
    } else if (status === 'FAILED') {
      clearInterval(faceT2IState.poll);
      faceT2IState.poll = null;
      renderFaceT2IFailed(data);
      toast('图片生成失败','bad');
    } else {
      renderFaceT2ILoading(status, data.taskId || taskId);
    }
  } catch (error) {
    clearInterval(faceT2IState.poll);
    faceT2IState.poll = null;
    renderFaceT2IFailed(faceT2IState.task, error?.message || '任务查询失败');
    toast(error?.message || '任务查询失败','bad');
  }
}

function setSkinUpscaleStatus(status, meta='') {
  const names = {
    IDLE:'等待处理',
    UPLOADING:'上传原图',
    SUBMITTING:'提交任务',
    QUEUED:'排队中',
    RUNNING:'处理中',
    SUCCESS:'处理完成',
    FAILED:'处理失败'
  };

  statusClass($('#skinUpscaleStatusDot'), status);
  $('#skinUpscaleStatusText').textContent = names[status] || status;
  $('#skinUpscaleTaskMeta').textContent = meta || 'READY';
}

function setSkinUpscaleDownload(url='', type='') {
  skinUpscaleState.outputSourceUrl = url || '';
  skinUpscaleState.outputUrl = toMediaUrl(url || '');
  skinUpscaleState.outputType = type || '';
  $('#skinUpscaleDownloadBtn').disabled = !skinUpscaleState.outputUrl;
}

function renderSkinUpscaleIdle() {
  setSkinUpscaleStatus('IDLE','READY');
  setSkinUpscaleDownload();
  $('#skinUpscaleResultArea').innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-mark">＋</div>' +
      '<strong>准备处理图片</strong>' +
      '<span>上传原图后即可开始高清放大。</span>' +
    '</div>';
}

function renderSkinUpscaleLoading(status, taskId) {
  setSkinUpscaleStatus(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  setSkinUpscaleDownload();
  $('#skinUpscaleResultArea').innerHTML =
    '<div class="loading-state">' +
      '<div class="loading-mark"></div>' +
      '<strong>' + (status === 'QUEUED' ? '任务正在排队' : status === 'UPLOADING' ? '正在上传原图' : '正在处理图片') + '</strong>' +
      '<span>' + (status === 'UPLOADING' ? '上传完成后会自动提交任务。' : '状态每 3 秒自动刷新。') + '</span>' +
    '</div>';
}

function renderSkinUpscaleSuccess(task) {
  const results = Array.isArray(task?.results) ? task.results : [];
  const images = results.filter(isImage);
  const primary = images[0] || results[0];

  setSkinUpscaleStatus('SUCCESS', task?.taskId ? ('TASK · ' + task.taskId) : 'DONE');

  if (!primary) {
    setSkinUpscaleDownload();
    $('#skinUpscaleResultArea').innerHTML =
      '<div class="empty-state"><div class="empty-mark">✓</div><strong>任务完成</strong><span>没有返回可预览图片。</span></div>';
    return;
  }

  const url = primary.url || '';
  const type = String(primary.outputType || 'png').toLowerCase();
  setSkinUpscaleDownload(url, type);

  if (images.length > 1) {
    $('#skinUpscaleResultArea').innerHTML =
      '<div class="image-result-grid">' +
        images.map(item => generatedImageTag(item.url || '')).join('') +
      '</div>';
    bindGeneratedImageFallbacks($('#skinUpscaleResultArea'));
  } else if (url) {
    $('#skinUpscaleResultArea').innerHTML = generatedImageTag(url);
    bindGeneratedImageFallbacks($('#skinUpscaleResultArea'));
  } else if (primary.text) {
    $('#skinUpscaleResultArea').innerHTML = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  }
}

function renderSkinUpscaleFailed(task, message) {
  setSkinUpscaleStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');
  setSkinUpscaleDownload();
  $('#skinUpscaleResultArea').innerHTML = failureHtml(task, message);
}

function getSkinUpscaleNodes(imageValue) {
  return [
    {
      nodeId:'46',
      fieldName:'image',
      fieldValue:imageValue,
      description:'image'
    }
  ];
}

async function runSkinUpscaleTask() {
  if (skinUpscaleState.running) return;

  if (!apiKey()) {
    toast('请先在设置中保存 RunningHub API Key','bad');
    openSettings();
    return;
  }

  if (!skinUpscaleState.inputFile) {
    toast('请先上传需要处理的图片','bad');
    return;
  }

  skinUpscaleState.running = true;
  $('#skinUpscaleRunBtn').disabled = true;
  $('.skin-upscale-generate-label').textContent = '上传原图…';
  setSkinUpscaleDownload();
  renderSkinUpscaleLoading('UPLOADING');

  try {
    const imageValue = await uploadFile(skinUpscaleState.inputFile, apiKey());

    setSkinUpscaleStatus('SUBMITTING','RUNNINGHUB');
    $('.skin-upscale-generate-label').textContent = '提交任务…';

    const data = await runRHApp(
      APPS[APP_KEYS.skinUpscale].appId,
      getSkinUpscaleNodes(imageValue)
    );
    skinUpscaleState.task = data;

    upsertHistory(APP_KEYS.skinUpscale, data, {
      createdAt:Date.now(),
      aspect:'',
      quality:'高清放大',
      duration:'',
      instance:instanceLabel($('#instanceType').value),
      prompt:''
    });

    toast('高清放大任务已提交','good');

    if (data.status === 'SUCCESS') {
      renderSkinUpscaleSuccess(data);
    } else if (data.status === 'FAILED') {
      renderSkinUpscaleFailed(data);
    } else {
      renderSkinUpscaleLoading(data.status || 'RUNNING', data.taskId);
      if (data.taskId) {
        clearInterval(skinUpscaleState.poll);
        skinUpscaleState.poll = setInterval(() => querySkinUpscaleTask(data.taskId), 3000);
      }
    }
  } catch (error) {
    renderSkinUpscaleFailed(skinUpscaleState.task, error?.message || '运行失败');
    toast(error?.message || '运行失败','bad');
  } finally {
    skinUpscaleState.running = false;
    $('#skinUpscaleRunBtn').disabled = false;
    $('.skin-upscale-generate-label').textContent = '开始处理';
  }
}

async function querySkinUpscaleTask(taskId) {
  try {
    const data = await queryRH(taskId);
    skinUpscaleState.task = data;
    const status = data.status || 'RUNNING';

    upsertHistory(APP_KEYS.skinUpscale, data, {taskId});

    if (status === 'SUCCESS') {
      clearInterval(skinUpscaleState.poll);
      skinUpscaleState.poll = null;
      renderSkinUpscaleSuccess(data);
      toast('图片处理完成','good');
    } else if (status === 'FAILED') {
      clearInterval(skinUpscaleState.poll);
      skinUpscaleState.poll = null;
      renderSkinUpscaleFailed(data);
      toast('图片处理失败','bad');
    } else {
      renderSkinUpscaleLoading(status, data.taskId || taskId);
    }
  } catch (error) {
    clearInterval(skinUpscaleState.poll);
    skinUpscaleState.poll = null;
    renderSkinUpscaleFailed(skinUpscaleState.task, error?.message || '任务查询失败');
    toast(error?.message || '任务查询失败','bad');
  }
}

function setMultiFastStatus(status, meta='') {
  const names = {
    IDLE:'等待生成',
    UPLOADING:'上传参考素材',
    SUBMITTING:'提交任务',
    QUEUED:'排队中',
    RUNNING:'生成中',
    SUCCESS:'生成完成',
    FAILED:'生成失败'
  };
  statusClass($('#multiFastStatusDot'), status);
  $('#multiFastStatusText').textContent = names[status] || status;
  $('#multiFastTaskMeta').textContent = meta || 'READY';
}

function setMultiFastDownload(url='', type='') {
  multiFastState.outputSourceUrl = url || '';
  multiFastState.outputUrl = toMediaUrl(url || '');
  multiFastState.outputType = type || '';
  $('#multiFastDownloadBtn').disabled = !multiFastState.outputUrl;
}

function renderMultiFastIdle() {
  setMultiFastStatus('IDLE','READY');
  setMultiFastDownload();
  $('#multiFastResultArea').innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-mark">▶</div>' +
      '<strong>准备生成视频</strong>' +
      '<span>添加参考素材并输入提示词，结果会显示在这里。</span>' +
    '</div>';
}

function renderMultiFastLoading(status, taskId) {
  setMultiFastStatus(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  setMultiFastDownload();
  $('#multiFastResultArea').innerHTML =
    '<div class="loading-state">' +
      '<div class="loading-mark"></div>' +
      '<strong>' + (status === 'QUEUED' ? '任务正在排队' : status === 'UPLOADING' ? '正在上传参考素材' : '视频正在生成') + '</strong>' +
      '<span>' + (status === 'UPLOADING' ? '上传完成后会自动提交任务。' : '状态每 3 秒自动刷新。') + '</span>' +
    '</div>';
}

function renderMultiFastSuccess(task) {
  const results = Array.isArray(task?.results) ? task.results : [];
  const primary = results.find(isVideo) || results.find(isImage) || results[0];

  setMultiFastStatus('SUCCESS', task?.taskId ? ('TASK · ' + task.taskId) : 'DONE');

  if (!primary) {
    setMultiFastDownload();
    $('#multiFastResultArea').innerHTML =
      '<div class="empty-state"><div class="empty-mark">✓</div><strong>任务完成</strong><span>没有返回可预览媒体。</span></div>';
    return;
  }

  const url = primary.url || '';
  const mediaUrl = toMediaUrl(url);
  const type = String(primary.outputType || 'output').toLowerCase();
  setMultiFastDownload(url, type);

  if (isVideo(primary) && url) {
    $('#multiFastResultArea').innerHTML = '<video src="' + esc(mediaUrl) + '" controls playsinline preload="metadata"></video>';
    const video = $('#multiFastResultArea video');
    video?.addEventListener('error', () => {
      const code = video.error?.code || '';
      toast('视频已生成，但浏览器加载失败' + (code ? ' · MEDIA_ERR_' + code : ''), 'bad');
    }, {once:true});
  } else if (isImage(primary) && url) {
    $('#multiFastResultArea').innerHTML = '<img src="' + esc(mediaUrl) + '" alt="generated output">';
  } else if (primary.text) {
    $('#multiFastResultArea').innerHTML = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  } else {
    $('#multiFastResultArea').innerHTML = '<div class="file-state"><strong>' + esc(type.toUpperCase()) + '</strong></div>';
  }
}

function renderMultiFastFailed(task, message) {
  setMultiFastStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');
  setMultiFastDownload();
  $('#multiFastResultArea').innerHTML = failureHtml(task, message);
}

function getMultiFastFixedNodes() {
  return [
    {nodeId:'147',fieldName:'value',fieldValue:'0.4',description:null},
    {nodeId:'132',fieldName:'value',fieldValue:'10',description:null},
    {nodeId:'159',fieldName:'lora_name',fieldValue:'MysticXXX_MMH3-V2.safetensors',description:null},
    {nodeId:'159',fieldName:'strength_model',fieldValue:'0',description:null},
    {nodeId:'167',fieldName:'lora_name',fieldValue:'MysticXXX_MMH3-V2.safetensors',description:null},
    {nodeId:'167',fieldName:'strength_model',fieldValue:'0',description:null},
    {nodeId:'168',fieldName:'lora_name',fieldValue:'MysticXXX_MMH3-V2.safetensors',description:null},
    {nodeId:'168',fieldName:'strength_model',fieldValue:'0',description:null},
    {nodeId:'163',fieldName:'value',fieldValue:'false',description:null},
    {nodeId:'158',fieldName:'value',fieldValue:'false',description:null}
  ];
}

async function runMultiFastTask() {
  if (multiFastState.running) return;

  if (!apiKey()) {
    toast('请先在设置中保存 RunningHub API Key','bad');
    openSettings();
    return;
  }

  const prompt = $('#multiFastPromptInput').value.trim();
  if (!prompt) {
    toast('请输入视频提示词','bad');
    $('#multiFastPromptInput').focus();
    return;
  }

  multiFastState.running = true;
  $('#multiFastRunBtn').disabled = true;
  $('.multi-fast-generate-label').textContent = '准备任务…';
  setMultiFastDownload();

  try {
    const selectedFiles = Object.entries(state.files).filter(([slot]) => !!MULTI_FAST_MEDIA[slot]);
    const uploadValues = {};
    let uploaded = 0;

    for (const [slot,file] of selectedFiles) {
      uploaded++;
      renderMultiFastLoading('UPLOADING');
      setMultiFastStatus('UPLOADING', uploaded + ' / ' + selectedFiles.length);
      $('.multi-fast-generate-label').textContent = '上传素材 ' + uploaded + '/' + selectedFiles.length;
      uploadValues[slot] = await uploadFile(file, apiKey());
    }

    const nodeInfoList = [
      {nodeId:'150',fieldName:'value',fieldValue:prompt,description:null},
      {nodeId:'115',fieldName:'aspect_ratio',fieldValue:$('#multiFastAspectRatio').value,description:null},
      ...getMultiFastFixedNodes()
    ];

    for (const [slot,config] of Object.entries(MULTI_FAST_MEDIA)) {
      nodeInfoList.push({
        nodeId:config.nodeId,
        fieldName:config.fieldName,
        fieldValue:uploadValues[slot] || 'None',
        description:null
      });
    }

    setMultiFastStatus('SUBMITTING','RUNNINGHUB');
    $('.multi-fast-generate-label').textContent = '提交任务…';

    const data = await runRHApp(APPS[APP_KEYS.multiFast].appId, nodeInfoList);
    multiFastState.task = data;

    upsertHistory(APP_KEYS.multiFast, data, {
      createdAt:Date.now(),
      aspect:($('#multiFastAspectRatio').value || '').split(' ')[0],
      quality:'加速版 · V2',
      duration:'',
      instance:instanceLabel($('#instanceType').value),
      prompt:prompt.slice(0,120)
    });

    toast('视频生成任务已提交','good');

    if (data.status === 'SUCCESS') {
      renderMultiFastSuccess(data);
    } else if (data.status === 'FAILED') {
      renderMultiFastFailed(data);
    } else {
      renderMultiFastLoading(data.status || 'RUNNING', data.taskId);
      if (data.taskId) {
        clearInterval(multiFastState.poll);
        multiFastState.poll = setInterval(() => queryMultiFastTask(data.taskId), 3000);
      }
    }
  } catch (error) {
    renderMultiFastFailed(multiFastState.task, error?.message || '运行失败');
    toast(error?.message || '运行失败','bad');
  } finally {
    multiFastState.running = false;
    $('#multiFastRunBtn').disabled = false;
    $('.multi-fast-generate-label').textContent = '开始生成';
  }
}

async function queryMultiFastTask(taskId) {
  try {
    const data = await queryRH(taskId);
    multiFastState.task = data;
    const status = data.status || 'RUNNING';

    upsertHistory(APP_KEYS.multiFast, data, {taskId});

    if (status === 'SUCCESS') {
      clearInterval(multiFastState.poll);
      multiFastState.poll = null;
      renderMultiFastSuccess(data);
      toast('视频生成完成','good');
    } else if (status === 'FAILED') {
      clearInterval(multiFastState.poll);
      multiFastState.poll = null;
      renderMultiFastFailed(data);
      toast('视频生成失败','bad');
    } else {
      renderMultiFastLoading(status, data.taskId || taskId);
    }
  } catch (error) {
    clearInterval(multiFastState.poll);
    multiFastState.poll = null;
    renderMultiFastFailed(multiFastState.task, error?.message || '任务查询失败');
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
$('#whiteMarbleRunBtn').onclick = runWhiteMarbleTask;
$('#whiteMarbleDownloadBtn').onclick = () => triggerDownload(whiteMarbleState, $('#whiteMarbleDownloadBtn'), 'rh-studio-white-marble');
$('#kq12RunBtn').onclick = runKQ12Task;
$('#kq12DownloadBtn').onclick = () => triggerDownload(kq12State, $('#kq12DownloadBtn'), 'rh-studio-kq12');
$('#faceT2IRunBtn').onclick = runFaceT2ITask;
$('#faceT2IDownloadBtn').onclick = () => triggerDownload(faceT2IState, $('#faceT2IDownloadBtn'), 'rh-studio-face-t2i-v3');
$('#skinUpscaleRunBtn').onclick = runSkinUpscaleTask;
$('#skinUpscaleDownloadBtn').onclick = () => triggerDownload(skinUpscaleState, $('#skinUpscaleDownloadBtn'), 'rh-studio-skin-upscale');
$('#multiFastRunBtn').onclick = runMultiFastTask;
$('#multiFastDownloadBtn').onclick = () => triggerDownload(multiFastState, $('#multiFastDownloadBtn'), 'rh-studio-minimax-h3-multi-fast');

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
    LS.whiteMarblePrompt,
    LS.whiteMarbleWidth,
    LS.whiteMarbleHeight,
    LS.whiteMarbleSeed,
    LS.kq12Prompt,
    LS.faceT2IPrompt,
    LS.faceT2IModelBranch,
    LS.faceT2IAspect,
    LS.faceT2IHD,
    LS.multiFastPrompt,
    LS.multiFastAspect,
    LS.appFilter,
    LS.inst
  ].forEach(k => localStorage.removeItem(k));

  Object.keys(state.files).forEach(slot => clearFile(slot));
  loadConfig();
  renderVideoIdle();
  renderImageIdle();
  renderWhiteMarbleIdle();
  renderKQ12Idle();
  renderFaceT2IIdle();
  clearFaceT2IFile();
  renderSkinUpscaleIdle();
  clearSkinUpscaleFile();
  renderMultiFastIdle();
  renderAppFilter('all', false, false);
  setActiveApp(APP_KEYS.video);
  toast('本地应用配置已重置');
};

loadConfig();
updateKeyUI();
Object.keys(MEDIA).forEach(renderFileSlot);
Object.keys(MULTI_FAST_MEDIA).forEach(renderFileSlot);
renderVideoIdle();
renderImageIdle();
renderWhiteMarbleIdle();
renderKQ12Idle();
renderFaceT2IIdle();
renderFaceT2IInput();
renderSkinUpscaleIdle();
renderSkinUpscaleInput();
renderMultiFastIdle();

const params = new URLSearchParams(window.location.search);
const requestedApp = params.get('app');
const recoveryTaskId = params.get('task');
const initialApp = APPS[requestedApp]
  ? requestedApp
  : (APPS[localStorage.getItem(LS.active)] ? localStorage.getItem(LS.active) : APP_KEYS.video);

setActiveApp(initialApp, false);
renderAppFilter(state.appFilter, false, true);

if (recoveryTaskId) {
  if (!apiKey()) {
    toast('请先在设置中保存 API Key，再恢复任务', 'bad');
  } else if (initialApp === APP_KEYS.image) {
    renderImageLoading('RUNNING', recoveryTaskId);
    queryImageTask(recoveryTaskId);
  } else if (initialApp === APP_KEYS.whiteMarble) {
    renderWhiteMarbleLoading('RUNNING', recoveryTaskId);
    queryWhiteMarbleTask(recoveryTaskId);
  } else if (initialApp === APP_KEYS.kq12Portrait) {
    renderKQ12Loading('RUNNING', recoveryTaskId);
    queryKQ12Task(recoveryTaskId);
  } else if (initialApp === APP_KEYS.faceT2I) {
    renderFaceT2ILoading('RUNNING', recoveryTaskId);
    queryFaceT2ITask(recoveryTaskId);
  } else if (initialApp === APP_KEYS.skinUpscale) {
    renderSkinUpscaleLoading('RUNNING', recoveryTaskId);
    querySkinUpscaleTask(recoveryTaskId);
  } else if (initialApp === APP_KEYS.multiFast) {
    renderMultiFastLoading('RUNNING', recoveryTaskId);
    queryMultiFastTask(recoveryTaskId);
  } else {
    renderVideoLoading('RUNNING', recoveryTaskId);
    queryVideoTask(recoveryTaskId);
  }
}
