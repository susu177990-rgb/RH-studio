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
  'skin-upscale': {
    key: 'skin-upscale',
    appId: '2050826078431793153',
    name: '去AI感真实皮肤高清放大',
    subtitle: 'Image Enhance',
    title: '去AI感真实皮肤高清放大',
    type: 'image'
  },
  'qwen-image-2-1-multi-edit': {
    key: 'qwen-image-2-1-multi-edit',
    appId: '2101915284503654402',
    name: 'Qwen Image 2.1 多图编辑',
    subtitle: 'Multi Image Edit',
    title: 'Qwen Image 2.1 多图编辑',
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
  skinUpscale: 'skin-upscale',
  qwenMultiEdit: 'qwen-image-2-1-multi-edit',
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
  multiFastPrompt: 'rhstudio.multiFast.prompt',
  multiFastAspect: 'rhstudio.multiFast.aspect',
  qwenMultiEditPrompt: 'rhstudio.qwenImage21MultiEdit.prompt',
  qwenMultiEditAspect: 'rhstudio.qwenImage21MultiEdit.aspect',
  qwenMultiEditQuality: 'rhstudio.qwenImage21MultiEdit.quality',
  qwenMultiEditCount: 'rhstudio.qwenImage21MultiEdit.count',
  appFilter: 'rhstudio.appFilter',
  inst: 'rhstudio.instanceType',
  history: 'rhstudio.generationHistory',
  runtimeTasks: 'rhstudio.runtimeTasks.v2'
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


const QWEN_MULTI_EDIT_MEDIA = {
  qwenImg420: { nodeId:'420', fieldName:'image', kind:'image', label:'参考图 1', order:1 },
  qwenImg432: { nodeId:'432', fieldName:'image', kind:'image', label:'参考图 2', order:2 },
  qwenImg433: { nodeId:'433', fieldName:'image', kind:'image', label:'参考图 3', order:3 },
  qwenImg436: { nodeId:'436', fieldName:'image', kind:'image', label:'参考图 4', order:4 },
  qwenImg435: { nodeId:'435', fieldName:'image', kind:'image', label:'参考图 5', order:5 },
  qwenImg434: { nodeId:'434', fieldName:'image', kind:'image', label:'参考图 6', order:6 }
};


const MATERIAL_LIBRARY = [
  { id:'image1', targetSlot:'img141', kind:'image', baseName:'图片1', accept:'image/*' },
  { id:'image2', targetSlot:'img142', kind:'image', baseName:'图片2', accept:'image/*' },
  { id:'image3', targetSlot:'img143', kind:'image', baseName:'图片3', accept:'image/*' },
  { id:'image4', targetSlot:'img161', kind:'image', baseName:'图片4', accept:'image/*' },
  { id:'image5', targetSlot:'img175', kind:'image', baseName:'图片5', accept:'image/*' },
  { id:'image6', targetSlot:'img176', kind:'image', baseName:'图片6', accept:'image/*' },
  { id:'video1', targetSlot:'video164', kind:'video', baseName:'视频1', accept:'video/*' },
  { id:'audio1', targetSlot:'audio144', kind:'audio', baseName:'音频1', accept:'audio/*' },
  { id:'audio2', targetSlot:'audio160', kind:'audio', baseName:'音频2', accept:'audio/*' },
  { id:'audio3', targetSlot:'audio189', kind:'audio', baseName:'音频3', accept:'audio/*' }
];

const MATERIAL_BY_ID = Object.fromEntries(MATERIAL_LIBRARY.map(item => [item.id, item]));
const MATERIAL_DB_NAME = 'rhstudio-material-library';
const MATERIAL_DB_VERSION = 1;
const MATERIAL_STORE_NAME = 'materials';

const materialState = {
  records: {},
  objectUrls: {},
  ready: false,
  loading: null,
  dbPromise: null
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

const qwenMultiEditState = {
  task: null,
  poll: null,
  running: false,
  outputUrl: '',
  outputSourceUrl: '',
  outputType: ''
};

const multiFastState = {
  task: null,
  poll: null,
  running: false,
  outputUrl: '',
  outputSourceUrl: '',
  outputType: ''
};

const autoBatchState = {
  running:false,
  stopRequested:false,
  batchId:'',
  appKey:'',
  total:0,
  concurrency:2,
  submitted:0,
  completed:0,
  failed:0,
  active:0,
  nextIndex:1,
  startedAt:0,
  lastError:'',
  downloading:false
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
  $('#workspaceSkinUpscale').classList.toggle('hidden', key !== APP_KEYS.skinUpscale);
  $('#workspaceQwenMultiEdit').classList.toggle('hidden', key !== APP_KEYS.qwenMultiEdit);
  $('#workspaceMultiFast').classList.toggle('hidden', key !== APP_KEYS.multiFast);

  const app = APPS[key];
  $('#currentAppTitle').textContent = app.title;
  $('#settingsCurrentApp').textContent = app.title;
  syncAutoGenerateAvailability();

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

function persistQwenMultiEditConfig() {
  localStorage.setItem(LS.qwenMultiEditPrompt, $('#qwenMultiEditPromptInput').value);
  localStorage.setItem(LS.qwenMultiEditAspect, $('#qwenMultiEditAspectRatio').value);
  localStorage.setItem(LS.qwenMultiEditQuality, $('#qwenMultiEditQuality').value);
  localStorage.setItem(LS.qwenMultiEditCount, $('#qwenMultiEditCount').value);
}

function persistMultiFastConfig() {
  localStorage.setItem(LS.multiFastPrompt, $('#multiFastPromptInput').value);
  localStorage.setItem(LS.multiFastAspect, $('#multiFastAspectRatio').value);
}

function loadConfig() {
  // One-time cleanup for removed app settings.
  localStorage.removeItem('rhstudio.image2mpUpscale.prompt');
  localStorage.removeItem('rhstudio.image2mpUpscale.aspectRatio');
  localStorage.removeItem('rhstudio.faceT2I.prompt');
  localStorage.removeItem('rhstudio.faceT2I.modelBranch');
  localStorage.removeItem('rhstudio.faceT2I.aspect');
  localStorage.removeItem('rhstudio.faceT2I.hd');
  localStorage.removeItem('rhstudio.runtimeTasks.v1');
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
  $('#qwenMultiEditPromptInput').value = localStorage.getItem(LS.qwenMultiEditPrompt) || '';
  $('#qwenMultiEditAspectRatio').value = localStorage.getItem(LS.qwenMultiEditAspect) || '9:16';
  $('#qwenMultiEditQuality').value = localStorage.getItem(LS.qwenMultiEditQuality) || '2000';
  $('#qwenMultiEditCount').value = localStorage.getItem(LS.qwenMultiEditCount) || '1';
  $('#multiFastPromptInput').value = localStorage.getItem(LS.multiFastPrompt) || '';
  $('#multiFastAspectRatio').value = localStorage.getItem(LS.multiFastAspect) || '9:16 (Portrait Widescreen)';
  state.appFilter = localStorage.getItem(LS.appFilter) || 'all';
  $('#instanceType').value = localStorage.getItem(LS.inst) || 'default';

  updateDurationUI();
  updatePromptCount();
  updateImagePromptCount();
  updateWhiteMarblePromptCount();
  updateKQ12PromptCount();
  updateQwenMultiEditPromptCount();
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

function updateQwenMultiEditPromptCount() {
  $('#qwenMultiEditPromptCount').textContent = String($('#qwenMultiEditPromptInput').value.length);
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

['qwenMultiEditPromptInput','qwenMultiEditAspectRatio','qwenMultiEditQuality','qwenMultiEditCount'].forEach(id => {
  const el = $('#' + id);
  el.addEventListener('input', () => {
    persistQwenMultiEditConfig();
    if (id === 'qwenMultiEditPromptInput') updateQwenMultiEditPromptCount();
  });
  el.addEventListener('change', persistQwenMultiEditConfig);
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


function getRuntimeTasks() {
  try {
    const value = JSON.parse(localStorage.getItem(LS.runtimeTasks) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function compactRuntimeResults(results) {
  if (!Array.isArray(results)) return [];
  return results.slice(0, 20).map(item => ({
    url:String(item?.url || ''),
    outputType:String(item?.outputType || ''),
    text:String(item?.text || '')
  })).filter(item => item.url || item.text);
}

function saveRuntimeTask(appKey, task, extra={}) {
  const taskId = String(task?.taskId || extra.taskId || '').trim();
  if (!taskId || !APPS[appKey]) return;

  const all = getRuntimeTasks();
  const previous = all[appKey] || {};
  const nextResults = compactRuntimeResults(task?.results);
  const status = String(task?.status || extra.status || previous.status || 'RUNNING');

  all[appKey] = {
    taskId,
    status,
    results:nextResults.length ? nextResults : (Array.isArray(previous.results) ? previous.results : []),
    errorCode:String(task?.errorCode || previous.errorCode || ''),
    errorMessage:String(task?.errorMessage || previous.errorMessage || ''),
    createdAt:Number(previous.createdAt || extra.createdAt || Date.now()),
    updatedAt:Date.now()
  };

  try {
    localStorage.setItem(LS.runtimeTasks, JSON.stringify(all));
  } catch {}
}

function clearRuntimeTask(appKey) {
  const all = getRuntimeTasks();
  if (!Object.prototype.hasOwnProperty.call(all, appKey)) return;
  delete all[appKey];
  try {
    localStorage.setItem(LS.runtimeTasks, JSON.stringify(all));
  } catch {}
}

function markRuntimeTaskFailed(appKey, taskId, message='任务查询失败') {
  saveRuntimeTask(appKey, {
    taskId,
    status:'FAILED',
    results:[],
    errorMessage:String(message || '任务查询失败')
  });
}

function runtimeSnapshotFromHistory(appKey) {
  const item = getHistory().find(entry => entry?.appKey === appKey && entry?.taskId);
  if (!item) return null;

  const status = String(item.status || '').toUpperCase();
  if (!['SUCCESS','FAILED'].includes(status)) return null;

  const result = item.resultUrl
    ? [{url:item.resultUrl, outputType:item.outputType || '', text:''}]
    : [];

  return {
    taskId:String(item.taskId || ''),
    status,
    results:result,
    errorCode:String(item.errorCode || ''),
    errorMessage:String(item.errorMessage || ''),
    createdAt:Number(item.createdAt || Date.now()),
    updatedAt:Number(item.updatedAt || item.createdAt || Date.now())
  };
}

function runtimeViews() {
  return {
    [APP_KEYS.video]: {
      state:videoState,
      renderLoading:renderVideoLoading,
      renderSuccess:renderVideoSuccess,
      renderFailed:renderVideoFailed,
      query:queryVideoTask
    },
    [APP_KEYS.image]: {
      state:imageState,
      renderLoading:renderImageLoading,
      renderSuccess:renderImageSuccess,
      renderFailed:renderImageFailed,
      query:queryImageTask
    },
    [APP_KEYS.whiteMarble]: {
      state:whiteMarbleState,
      renderLoading:renderWhiteMarbleLoading,
      renderSuccess:renderWhiteMarbleSuccess,
      renderFailed:renderWhiteMarbleFailed,
      query:queryWhiteMarbleTask
    },
    [APP_KEYS.kq12Portrait]: {
      state:kq12State,
      renderLoading:renderKQ12Loading,
      renderSuccess:renderKQ12Success,
      renderFailed:renderKQ12Failed,
      query:queryKQ12Task
    },
    [APP_KEYS.skinUpscale]: {
      state:skinUpscaleState,
      renderLoading:renderSkinUpscaleLoading,
      renderSuccess:renderSkinUpscaleSuccess,
      renderFailed:renderSkinUpscaleFailed,
      query:querySkinUpscaleTask
    },
    [APP_KEYS.qwenMultiEdit]: {
      state:qwenMultiEditState,
      renderLoading:renderQwenMultiEditLoading,
      renderSuccess:renderQwenMultiEditSuccess,
      renderFailed:renderQwenMultiEditFailed,
      query:queryQwenMultiEditTask
    },
    [APP_KEYS.multiFast]: {
      state:multiFastState,
      renderLoading:renderMultiFastLoading,
      renderSuccess:renderMultiFastSuccess,
      renderFailed:renderMultiFastFailed,
      query:queryMultiFastTask
    }
  };
}

function restoreRuntimeTasks(skipApp='') {
  const saved = getRuntimeTasks();
  const views = runtimeViews();

  Object.entries(views).forEach(([appKey, view]) => {
    if (appKey === skipApp) return;

    const snapshot = saved[appKey] || runtimeSnapshotFromHistory(appKey);
    if (!snapshot?.taskId) return;

    view.state.task = snapshot;
    const status = String(snapshot.status || 'RUNNING').toUpperCase();

    if (status === 'SUCCESS') {
      view.renderSuccess(snapshot);
      if (!saved[appKey]) saveRuntimeTask(appKey, snapshot);
      return;
    }

    if (status === 'FAILED') {
      view.renderFailed(snapshot, snapshot.errorMessage || '生成失败');
      if (!saved[appKey]) saveRuntimeTask(appKey, snapshot);
      return;
    }

    view.renderLoading(status, snapshot.taskId);

    if (!apiKey()) return;

    clearInterval(view.state.poll);
    view.state.poll = setInterval(() => view.query(snapshot.taskId), 3000);
    view.query(snapshot.taskId);
  });
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
    errorMessage: task?.errorMessage || previous.errorMessage || '',
    batchId: extra.batchId ?? previous.batchId ?? '',
    batchIndex: Number(extra.batchIndex ?? previous.batchIndex ?? 0),
    batchTotal: Number(extra.batchTotal ?? previous.batchTotal ?? 0),
    clothesSeed: extra.clothesSeed ?? previous.clothesSeed ?? '',
    performanceSeed: extra.performanceSeed ?? previous.performanceSeed ?? '',
    personaSeed: extra.personaSeed ?? previous.personaSeed ?? '',
    personaId: extra.personaId ?? previous.personaId ?? '',
    personaName: extra.personaName ?? previous.personaName ?? '',
    actionCount: Number(extra.actionCount ?? previous.actionCount ?? 0),
    signatureCount: Number(extra.signatureCount ?? previous.signatureCount ?? 0),
    arc: extra.arc ?? previous.arc ?? ''
  };

  saveHistory([next, ...items.filter(item => item.taskId !== taskId)]);
  if (!next.batchId) saveRuntimeTask(appKey, task, extra);
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

function isVideoAppKey(appKey) {
  return appKey === APP_KEYS.video || appKey === APP_KEYS.multiFast;
}

function currentBatchMediaMap(appKey) {
  return appKey === APP_KEYS.multiFast ? MULTI_FAST_MEDIA : MEDIA;
}

function currentBatchMaterialCount(appKey=state.activeApp) {
  if (!isVideoAppKey(appKey)) return 0;
  const mediaMap = currentBatchMediaMap(appKey);
  return Object.keys(state.files).filter(slot => mediaMap[slot] && state.files[slot]).length;
}

function syncAutoGenerateAvailability() {
  const start = $('#startAutoGenerate');
  const appLabel = $('#autoGenerateApp');
  const materialLabel = $('#autoGenerateMaterials');
  const isVideo = isVideoAppKey(state.activeApp);

  $$('[data-auto-generate-app]').forEach(button => {
    const ownsRunningBatch = autoBatchState.running &&
      button.dataset.autoGenerateApp === autoBatchState.appKey;
    button.disabled = autoBatchState.running;
    button.classList.toggle('is-running', ownsRunningBatch);
  });

  if (appLabel) appLabel.textContent = isVideo ? APPS[state.activeApp].title : '当前页面不支持批量视频';
  if (materialLabel) materialLabel.textContent = currentBatchMaterialCount() + ' 个';
  if (start) start.disabled = autoBatchState.running || !isVideo;
  syncCurrentBatchDownloadButton();
}

function openAutoGenerate(appKey=state.activeApp) {
  if (!isVideoAppKey(appKey)) {
    toast('批量生成仅支持视频应用','bad');
    return;
  }

  if (state.activeApp !== appKey) setActiveApp(appKey);

  closeDrawers();
  syncAutoGenerateAvailability();
  $('#autoGenerateOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

$$('[data-auto-generate-app]').forEach(button => {
  button.addEventListener('click', () => openAutoGenerate(button.dataset.autoGenerateApp));
});
$('#openSettings').onclick = openSettings;
$('#openHistory').onclick = openHistory;
$('#openMaterialSettings').onclick = openMaterialSettings;
$('#quickFillMaterials').onclick = fillSavedMaterials;
$$('[data-close]').forEach(el => el.onclick = closeDrawers);

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrawers();
});


function openMaterialDB() {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('当前浏览器不支持本地素材缓存'));
  }
  if (materialState.dbPromise) return materialState.dbPromise;

  materialState.dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(MATERIAL_DB_NAME, MATERIAL_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MATERIAL_STORE_NAME)) {
        db.createObjectStore(MATERIAL_STORE_NAME, { keyPath:'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('打开本地素材缓存失败'));
    request.onblocked = () => reject(new Error('素材缓存数据库被其他页面占用，请关闭旧页面后重试'));
  });

  return materialState.dbPromise;
}

function materialExtension(file) {
  const fromName = String(file?.name || '').match(/\.([a-zA-Z0-9]{1,8})$/);
  if (fromName) return '.' + fromName[1].toLowerCase();

  const type = String(file?.type || '').toLowerCase();
  const map = {
    'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif','image/avif':'.avif',
    'video/mp4':'.mp4','video/webm':'.webm','video/quicktime':'.mov','video/x-m4v':'.m4v',
    'audio/mpeg':'.mp3','audio/wav':'.wav','audio/x-wav':'.wav','audio/mp4':'.m4a','audio/aac':'.aac','audio/ogg':'.ogg','audio/webm':'.webm'
  };
  return map[type] || '';
}

function renamedMaterialFile(config, file) {
  const ext = materialExtension(file);
  return new File([file], config.baseName + ext, {
    type:file.type || '',
    lastModified:Date.now()
  });
}

function fileFromMaterialRecord(record) {
  if (!record?.blob) return null;
  return new File([record.blob], record.fileName || record.baseName || '素材', {
    type:record.type || record.blob.type || '',
    lastModified:record.updatedAt || Date.now()
  });
}

function formatMaterialBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return value + ' B';
  if (value < 1024 * 1024) return (value / 1024).toFixed(value < 10 * 1024 ? 1 : 0) + ' KB';
  return (value / (1024 * 1024)).toFixed(value < 10 * 1024 * 1024 ? 1 : 0) + ' MB';
}

function clearMaterialPreviewUrls() {
  Object.values(materialState.objectUrls).forEach(url => {
    try { URL.revokeObjectURL(url); } catch {}
  });
  materialState.objectUrls = {};
}

function updateMaterialLibraryBadges() {
  const count = MATERIAL_LIBRARY.filter(config => !!materialState.records[config.id]).length;
  const saved = $('#materialSavedCount');
  const badge = $('#materialLibraryBadge');
  if (saved) saved.textContent = String(count);
  if (badge) badge.textContent = count + ' / ' + MATERIAL_LIBRARY.length;
}

function materialPreviewHtml(config, record) {
  if (!record?.blob) {
    const label = config.kind === 'image' ? 'IMG' : config.kind === 'video' ? 'VIDEO' : 'AUDIO';
    return '<span class="material-kind-icon' + (config.kind === 'audio' ? ' audio' : '') + '">' +
      (config.kind === 'audio' ? '♪' : label) + '</span>';
  }

  const url = URL.createObjectURL(record.blob);
  materialState.objectUrls[config.id] = url;

  if (config.kind === 'image') {
    return '<img src="' + esc(url) + '" alt="' + esc(config.baseName) + '">';
  }
  if (config.kind === 'video') {
    return '<video src="' + esc(url) + '" muted playsinline preload="metadata"></video>';
  }
  return '<span class="material-kind-icon audio">♪</span>';
}

function renderMaterialLibrary() {
  const grid = $('#materialLibraryGrid');
  if (!grid) return;

  clearMaterialPreviewUrls();

  grid.innerHTML = MATERIAL_LIBRARY.map(config => {
    const record = materialState.records[config.id];
    const kindLabel = config.kind === 'image' ? 'IMAGE' : config.kind === 'video' ? 'VIDEO' : 'AUDIO';
    const meta = record
      ? ((record.fileName || config.baseName) + ' · ' + formatMaterialBytes(record.size))
      : '未设置 · 点击上传后自动保存';

    return (
      '<article class="material-card ' + (record ? 'has-file' : '') + '" data-material-card="' + esc(config.id) + '">' +
        '<div class="material-card-preview">' + materialPreviewHtml(config, record) + '</div>' +
        '<div class="material-card-body">' +
          '<div class="material-card-copy">' +
            '<strong>' + esc(config.baseName) + '</strong>' +
            '<b>' + kindLabel + '</b>' +
          '</div>' +
          '<span class="material-card-meta">' + esc(meta) + '</span>' +
          '<div class="material-card-actions">' +
            '<button class="material-upload-btn" data-material-upload="' + esc(config.id) + '" type="button">' + (record ? '更换' : '上传') + '</button>' +
            '<button class="material-delete-btn" data-material-delete="' + esc(config.id) + '" type="button" ' + (record ? '' : 'disabled') + '>删除</button>' +
          '</div>' +
          '<input data-material-input="' + esc(config.id) + '" type="file" accept="' + esc(config.accept) + '" hidden>' +
        '</div>' +
      '</article>'
    );
  }).join('');

  document.querySelectorAll('[data-material-upload]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.materialUpload;
      const input = $('[data-material-input="' + id + '"]');
      input?.click();
    });
  });

  document.querySelectorAll('[data-material-input]').forEach(input => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      await savePersistentMaterial(input.dataset.materialInput, file);
      input.value = '';
    });
  });

  document.querySelectorAll('[data-material-delete]').forEach(button => {
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      await deletePersistentMaterial(button.dataset.materialDelete);
    });
  });

  updateMaterialLibraryBadges();
}

async function ensureMaterialLibrary() {
  if (materialState.ready) return materialState.records;
  if (materialState.loading) return materialState.loading;

  materialState.loading = (async () => {
    const db = await openMaterialDB();
    const records = await new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIAL_STORE_NAME, 'readonly');
      const request = tx.objectStore(MATERIAL_STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || new Error('读取本地素材失败'));
    });

    materialState.records = {};
    records.forEach(record => {
      if (record?.id && MATERIAL_BY_ID[record.id]) materialState.records[record.id] = record;
    });
    materialState.ready = true;
    updateMaterialLibraryBadges();
    if ($('#materialSettingsOverlay') && !$('#materialSettingsOverlay').classList.contains('hidden')) {
      renderMaterialLibrary();
    }

    try { navigator.storage?.persist?.(); } catch {}
    return materialState.records;
  })();

  try {
    return await materialState.loading;
  } finally {
    materialState.loading = null;
  }
}

async function savePersistentMaterial(id, file) {
  const config = MATERIAL_BY_ID[id];
  if (!config || !file) return;

  if (file.size > MAX_RH_UPLOAD_BYTES) {
    toast('单个素材不能超过 30MB：' + file.name, 'bad');
    return;
  }

  if (file.type && !file.type.startsWith(config.kind + '/')) {
    toast('文件类型不匹配：' + config.baseName, 'bad');
    return;
  }

  const renamed = renamedMaterialFile(config, file);
  const record = {
    id:config.id,
    kind:config.kind,
    baseName:config.baseName,
    targetSlot:config.targetSlot,
    fileName:renamed.name,
    type:renamed.type,
    size:renamed.size,
    updatedAt:Date.now(),
    blob:renamed
  };

  try {
    const db = await openMaterialDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIAL_STORE_NAME, 'readwrite');
      tx.objectStore(MATERIAL_STORE_NAME).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('素材保存失败'));
      tx.onabort = () => reject(tx.error || new Error('素材保存被中止'));
    });

    materialState.records[id] = record;
    materialState.ready = true;
    renderMaterialLibrary();
    toast(config.baseName + ' 已保存', 'good');
  } catch (error) {
    toast(error?.name === 'QuotaExceededError' ? '浏览器存储空间不足，素材未保存' : (error?.message || '素材保存失败'), 'bad');
  }
}

async function deletePersistentMaterial(id) {
  const config = MATERIAL_BY_ID[id];
  if (!config) return;

  try {
    const db = await openMaterialDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIAL_STORE_NAME, 'readwrite');
      tx.objectStore(MATERIAL_STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('删除素材失败'));
      tx.onabort = () => reject(tx.error || new Error('删除素材被中止'));
    });

    delete materialState.records[id];
    materialState.ready = true;
    renderMaterialLibrary();
    toast(config.baseName + ' 已删除');
  } catch (error) {
    toast(error?.message || '删除素材失败', 'bad');
  }
}

async function openMaterialSettings() {
  closeDrawers();
  $('#materialSettingsOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  try {
    await ensureMaterialLibrary();
    renderMaterialLibrary();
  } catch (error) {
    toast(error?.message || '无法读取本地素材', 'bad');
  }
}

async function fillSavedMaterials() {
  try {
    await ensureMaterialLibrary();
  } catch (error) {
    toast(error?.message || '无法读取本地素材', 'bad');
    return;
  }

  let count = 0;
  for (const config of MATERIAL_LIBRARY) {
    const record = materialState.records[config.id];
    if (!record) continue;
    const file = fileFromMaterialRecord(record);
    if (!file) continue;
    setFile(config.targetSlot, file);
    count += 1;
  }

  if (!count) {
    toast('还没有保存素材，请先在素材设置中上传', 'bad');
    openMaterialSettings();
    return;
  }

  toast('已填入 ' + count + ' 个保存素材', 'good');
}

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
  const config = MEDIA[slot] || MULTI_FAST_MEDIA[slot] || QWEN_MULTI_EDIT_MEDIA[slot];
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

  syncAutoGenerateAvailability();
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

async function runRHApp(appId, nodeInfoList, options={}) {
  const res = await fetch('/api/rh/run', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'x-rh-key':apiKey()
    },
    body:JSON.stringify({
      appId,
      nodeInfoList,
      instanceType:options.instanceType || $('#instanceType').value || 'default',
      usePersonalQueue:'false'
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ('提交失败 (' + res.status + ')'));

  const taskId = String(data?.taskId || '').trim();
  if (!taskId) {
    throw new Error(
      data?.errorMessage ||
      data?.message ||
      data?.msg ||
      'RunningHub 未返回 taskId，任务未创建'
    );
  }

  data.taskId = taskId;
  if (data.status) data.status = String(data.status).toUpperCase();
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

  const status = String(data?.status || '').trim().toUpperCase();
  if (!status) {
    throw new Error(
      data?.errorMessage ||
      data?.message ||
      data?.msg ||
      'RunningHub 查询响应缺少 status'
    );
  }

  data.status = status;
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
    $('#resultArea').innerHTML = '<video class="generated-video" src="' + esc(mediaUrl) + '" controls playsinline preload="metadata"></video>';
    const video = $('#resultArea video.generated-video');
    video?.addEventListener('error', () => {
      const code = video.error?.code || '';
      toast('视频已生成，但浏览器加载失败' + (code ? ' · MEDIA_ERR_' + code : ''), 'bad');
    }, {once:true});
  } else if (isImage(primary) && url) {
    $('#resultArea').innerHTML = generatedImageTag(url);
    bindGeneratedImageFallbacks($('#resultArea'));
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

  videoState.task = null;
  clearRuntimeTask(APP_KEYS.video);
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
    const status = data.status;

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
    markRuntimeTaskFailed(APP_KEYS.video, taskId, error?.message || '任务查询失败');
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

  imageState.task = null;
  clearRuntimeTask(APP_KEYS.image);
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
    const status = data.status;

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
    markRuntimeTaskFailed(APP_KEYS.image, taskId, error?.message || '任务查询失败');
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

  whiteMarbleState.task = null;
  clearRuntimeTask(APP_KEYS.whiteMarble);
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
    const status = data.status;

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
    markRuntimeTaskFailed(APP_KEYS.whiteMarble, taskId, error?.message || '任务查询失败');
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

  kq12State.task = null;
  clearRuntimeTask(APP_KEYS.kq12Portrait);
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
    const status = data.status;

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
    markRuntimeTaskFailed(APP_KEYS.kq12Portrait, taskId, error?.message || '任务查询失败');
    renderKQ12Failed(kq12State.task, error?.message || '任务查询失败');
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

  skinUpscaleState.task = null;
  clearRuntimeTask(APP_KEYS.skinUpscale);
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
    const status = data.status;

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
    markRuntimeTaskFailed(APP_KEYS.skinUpscale, taskId, error?.message || '任务查询失败');
    renderSkinUpscaleFailed(skinUpscaleState.task, error?.message || '任务查询失败');
    toast(error?.message || '任务查询失败','bad');
  }
}

function setQwenMultiEditStatus(status, meta='') {
  const names = {
    IDLE:'等待生成',
    UPLOADING:'上传参考图',
    SUBMITTING:'提交任务',
    QUEUED:'排队中',
    RUNNING:'生成中',
    SUCCESS:'生成完成',
    FAILED:'生成失败'
  };
  statusClass($('#qwenMultiEditStatusDot'), status);
  $('#qwenMultiEditStatusText').textContent = names[status] || status;
  $('#qwenMultiEditTaskMeta').textContent = meta || 'READY';
}

function setQwenMultiEditDownload(url='', type='') {
  qwenMultiEditState.outputSourceUrl = url || '';
  qwenMultiEditState.outputUrl = toMediaUrl(url || '');
  qwenMultiEditState.outputType = type || '';
  $('#qwenMultiEditDownloadBtn').disabled = !qwenMultiEditState.outputUrl;
}

function renderQwenMultiEditIdle() {
  setQwenMultiEditStatus('IDLE','READY');
  setQwenMultiEditDownload();
  $('#qwenMultiEditResultArea').innerHTML =
    '<div class="empty-state">' +
      '<div class="empty-mark">＋</div>' +
      '<strong>准备编辑图片</strong>' +
      '<span>上传参考图并输入编辑指令，结果会显示在这里。</span>' +
    '</div>';
}

function renderQwenMultiEditLoading(status, taskId) {
  setQwenMultiEditStatus(status, taskId ? ('TASK · ' + taskId) : 'PROCESSING');
  setQwenMultiEditDownload();
  $('#qwenMultiEditResultArea').innerHTML =
    '<div class="loading-state">' +
      '<div class="loading-mark"></div>' +
      '<strong>' + (status === 'QUEUED' ? '任务正在排队' : status === 'UPLOADING' ? '正在上传参考图' : '图片正在生成') + '</strong>' +
      '<span>' + (status === 'UPLOADING' ? '上传完成后会自动提交任务。' : '状态每 3 秒自动刷新。') + '</span>' +
    '</div>';
}

function renderQwenMultiEditSuccess(task) {
  const results = Array.isArray(task?.results) ? task.results : [];
  const images = results.filter(isImage);
  const primary = images[0] || results[0];

  setQwenMultiEditStatus('SUCCESS', task?.taskId ? ('TASK · ' + task.taskId) : 'DONE');

  if (!primary) {
    setQwenMultiEditDownload();
    $('#qwenMultiEditResultArea').innerHTML =
      '<div class="empty-state"><div class="empty-mark">✓</div><strong>任务完成</strong><span>没有返回可预览图片。</span></div>';
    return;
  }

  const url = primary.url || '';
  const type = String(primary.outputType || 'png').toLowerCase();
  setQwenMultiEditDownload(url, type);

  if (images.length > 1) {
    $('#qwenMultiEditResultArea').innerHTML =
      '<div class="image-result-grid">' +
        images.map(item => generatedImageTag(item.url || '')).join('') +
      '</div>';
    bindGeneratedImageFallbacks($('#qwenMultiEditResultArea'));
  } else if (url) {
    $('#qwenMultiEditResultArea').innerHTML = generatedImageTag(url);
    bindGeneratedImageFallbacks($('#qwenMultiEditResultArea'));
  } else if (primary.text) {
    $('#qwenMultiEditResultArea').innerHTML = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  }
}

function renderQwenMultiEditFailed(task, message) {
  setQwenMultiEditStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');
  setQwenMultiEditDownload();
  $('#qwenMultiEditResultArea').innerHTML = failureHtml(task, message);
}

function getQwenMultiEditNodes(prompt, uploadValues) {
  const nodes = [];

  for (const [slot,config] of Object.entries(QWEN_MULTI_EDIT_MEDIA)) {
    nodes.push({
      nodeId:config.nodeId,
      fieldName:config.fieldName,
      fieldValue:uploadValues[slot] || 'None',
      description:null
    });
  }

  nodes.push(
    {nodeId:'479',fieldName:'aspect_ratio',fieldValue:$('#qwenMultiEditAspectRatio').value || '9:16',description:null},
    {nodeId:'481',fieldName:'value',fieldValue:$('#qwenMultiEditQuality').value || '2000',description:null},
    {nodeId:'482',fieldName:'value',fieldValue:$('#qwenMultiEditCount').value || '1',description:null},
    {nodeId:'478',fieldName:'text',fieldValue:prompt,description:null}
  );

  return nodes;
}

async function runQwenMultiEditTask() {
  if (qwenMultiEditState.running) return;

  const key = apiKey();
  if (!key) {
    toast('请先在设置中保存 RunningHub API Key','bad');
    openSettings();
    return;
  }

  const prompt = $('#qwenMultiEditPromptInput').value.trim();
  if (!prompt) {
    toast('请输入图片编辑指令','bad');
    $('#qwenMultiEditPromptInput').focus();
    return;
  }

  const selectedFiles = Object.entries(state.files).filter(([slot]) => !!QWEN_MULTI_EDIT_MEDIA[slot]);
  if (!selectedFiles.length) {
    toast('请至少上传 1 张参考图','bad');
    return;
  }

  qwenMultiEditState.task = null;
  clearRuntimeTask(APP_KEYS.qwenMultiEdit);
  qwenMultiEditState.running = true;
  $('#qwenMultiEditRunBtn').disabled = true;
  $('.qwen-multi-edit-generate-label').textContent = '准备任务…';
  setQwenMultiEditDownload();

  try {
    const uploadValues = {};
    let uploaded = 0;

    for (const [slot,file] of selectedFiles) {
      uploaded++;
      renderQwenMultiEditLoading('UPLOADING');
      setQwenMultiEditStatus('UPLOADING', uploaded + ' / ' + selectedFiles.length);
      $('.qwen-multi-edit-generate-label').textContent = '上传参考图 ' + uploaded + '/' + selectedFiles.length;
      uploadValues[slot] = await uploadFile(file, key);
    }

    setQwenMultiEditStatus('SUBMITTING','RUNNINGHUB');
    $('.qwen-multi-edit-generate-label').textContent = '提交任务…';

    const data = await runRHApp(
      APPS[APP_KEYS.qwenMultiEdit].appId,
      getQwenMultiEditNodes(prompt, uploadValues)
    );
    qwenMultiEditState.task = data;

    upsertHistory(APP_KEYS.qwenMultiEdit, data, {
      createdAt:Date.now(),
      aspect:$('#qwenMultiEditAspectRatio').value || '9:16',
      quality:({'1000':'1K','2000':'2K','4000':'4K'}[$('#qwenMultiEditQuality').value] || $('#qwenMultiEditQuality').value) + ' · ' + ($('#qwenMultiEditCount').value || '1') + '张',
      duration:'',
      instance:instanceLabel($('#instanceType').value),
      prompt:prompt.slice(0,120)
    });

    toast('Qwen Image 2.1 编辑任务已提交','good');

    if (data.status === 'SUCCESS') {
      renderQwenMultiEditSuccess(data);
    } else if (data.status === 'FAILED') {
      renderQwenMultiEditFailed(data);
    } else {
      renderQwenMultiEditLoading(data.status || 'RUNNING', data.taskId);
      if (data.taskId) {
        clearInterval(qwenMultiEditState.poll);
        qwenMultiEditState.poll = setInterval(() => queryQwenMultiEditTask(data.taskId), 3000);
      }
    }
  } catch (error) {
    renderQwenMultiEditFailed(qwenMultiEditState.task, error?.message || '运行失败');
    toast(error?.message || '运行失败','bad');
  } finally {
    qwenMultiEditState.running = false;
    $('#qwenMultiEditRunBtn').disabled = false;
    $('.qwen-multi-edit-generate-label').textContent = '开始生成';
  }
}

async function queryQwenMultiEditTask(taskId) {
  try {
    const data = await queryRH(taskId);
    qwenMultiEditState.task = data;
    const status = data.status;

    upsertHistory(APP_KEYS.qwenMultiEdit, data, {taskId});

    if (status === 'SUCCESS') {
      clearInterval(qwenMultiEditState.poll);
      qwenMultiEditState.poll = null;
      renderQwenMultiEditSuccess(data);
      toast('Qwen Image 2.1 编辑完成','good');
    } else if (status === 'FAILED') {
      clearInterval(qwenMultiEditState.poll);
      qwenMultiEditState.poll = null;
      renderQwenMultiEditFailed(data);
      toast('Qwen Image 2.1 编辑失败','bad');
    } else {
      renderQwenMultiEditLoading(status, data.taskId || taskId);
    }
  } catch (error) {
    clearInterval(qwenMultiEditState.poll);
    qwenMultiEditState.poll = null;
    markRuntimeTaskFailed(APP_KEYS.qwenMultiEdit, taskId, error?.message || '任务查询失败');
    renderQwenMultiEditFailed(qwenMultiEditState.task, error?.message || '任务查询失败');
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
    $('#multiFastResultArea').innerHTML = '<video class="generated-video" src="' + esc(mediaUrl) + '" controls playsinline preload="metadata"></video>';
    const video = $('#multiFastResultArea video.generated-video');
    video?.addEventListener('error', () => {
      const code = video.error?.code || '';
      toast('视频已生成，但浏览器加载失败' + (code ? ' · MEDIA_ERR_' + code : ''), 'bad');
    }, {once:true});
  } else if (isImage(primary) && url) {
    $('#multiFastResultArea').innerHTML = generatedImageTag(url);
    bindGeneratedImageFallbacks($('#multiFastResultArea'));
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

  multiFastState.task = null;
  clearRuntimeTask(APP_KEYS.multiFast);
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
    const status = data.status;

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
    markRuntimeTaskFailed(APP_KEYS.multiFast, taskId, error?.message || '任务查询失败');
    renderMultiFastFailed(multiFastState.task, error?.message || '任务查询失败');
    toast(error?.message || '任务查询失败','bad');
  }
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function autoBatchHasManualVideoTask() {
  const states = [videoState, multiFastState];
  return states.some(item => {
    const status = String(item?.task?.status || '').toUpperCase();
    return item?.running || !!item?.poll || (!!item?.task?.taskId && !['SUCCESS','FAILED'].includes(status));
  });
}


function autoBatchOutputExtension(item) {
  const raw = String(item?.outputType || '').toLowerCase();
  const clean = raw.replace(/[^a-z0-9]/g, '');
  if (clean && clean.length <= 8) return clean;

  try {
    const path = new URL(item?.resultUrl || '').pathname;
    const match = path.match(/\.([a-z0-9]{2,8})$/i);
    if (match) return match[1].toLowerCase();
  } catch {}

  return 'mp4';
}

function currentBatchDownloadableItems() {
  if (!autoBatchState.batchId) return [];

  return getHistory()
    .filter(item =>
      item?.batchId === autoBatchState.batchId &&
      String(item?.status || '').toUpperCase() === 'SUCCESS' &&
      !!item?.resultUrl
    )
    .sort((a,b) => Number(a.batchIndex || 0) - Number(b.batchIndex || 0));
}

function syncCurrentBatchDownloadButton() {
  const button = $('#downloadCurrentBatch');
  if (!button) return;

  const items = currentBatchDownloadableItems();
  const ready = !autoBatchState.running &&
    !autoBatchState.downloading &&
    !!autoBatchState.batchId &&
    items.length > 0;

  button.disabled = !ready;
  button.title = autoBatchState.batchId
    ? (items.length
        ? ('本次批量可下载 ' + items.length + ' 个成功结果')
        : '本次批量暂无可下载的成功结果')
    : '完成一次批量生成后可在这里打包下载';
}

async function downloadCurrentBatchArchive() {
  if (autoBatchState.running || autoBatchState.downloading) return;

  const items = currentBatchDownloadableItems();
  if (!autoBatchState.batchId || !items.length) {
    toast('本次批量暂无可下载的成功结果','bad');
    syncCurrentBatchDownloadButton();
    return;
  }

  const button = $('#downloadCurrentBatch');
  const original = button?.innerHTML || '';
  autoBatchState.downloading = true;

  if (button) {
    button.disabled = true;
    button.innerHTML = '<span>正在打包</span><b>…</b>';
  }

  try {
    const payload = items.map((item, index) => ({
      url:item.resultUrl,
      taskId:item.taskId,
      filename:
        'batch-' +
        String(Number(item.batchIndex || index + 1)).padStart(3,'0') +
        '-' +
        String(item.taskId || 'task').replace(/[^a-zA-Z0-9_-]/g,'') +
        '.' +
        autoBatchOutputExtension(item)
    }));

    const safeBatchId = String(autoBatchState.batchId)
      .replace(/[^a-zA-Z0-9_-]/g,'')
      .slice(-32) || 'current';

    const archiveName = 'rh-studio-batch-' + safeBatchId + '.zip';
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

    toast('本次批量 ZIP 下载已开始','good');
  } catch (error) {
    toast(error?.message || '本次批量打包失败','bad');
  } finally {
    autoBatchState.downloading = false;
    if (button && original) button.innerHTML = original;
    syncCurrentBatchDownloadButton();
  }
}

function setAutoBatchControlsLocked(locked) {
  if ($('#runBtn')) $('#runBtn').disabled = !!locked;
  if ($('#multiFastRunBtn')) $('#multiFastRunBtn').disabled = !!locked;
  if ($('#startAutoGenerate')) $('#startAutoGenerate').disabled = !!locked || !isVideoAppKey(state.activeApp);
  if ($('#stopAutoGenerate')) $('#stopAutoGenerate').disabled = !locked;
  if ($('#downloadCurrentBatch')) $('#downloadCurrentBatch').disabled = !!locked || autoBatchState.downloading;

  $$('[data-auto-generate-app]').forEach(button => {
    const ownsRunningBatch = !!locked &&
      button.dataset.autoGenerateApp === autoBatchState.appKey;
    button.disabled = !!locked;
    button.classList.toggle('is-running', ownsRunningBatch);
  });
}

function updateAutoBatchProgress(statusText='', detail='') {
  const finished = autoBatchState.completed + autoBatchState.failed;
  const total = autoBatchState.total || 0;
  const pct = total > 0 ? Math.min(100, Math.max(0, finished / total * 100)) : 0;

  if ($('#autoGenerateStatus')) $('#autoGenerateStatus').textContent = statusText || (autoBatchState.running ? '批量生成中' : '等待开始');
  if ($('#autoGenerateCounter')) $('#autoGenerateCounter').textContent = finished + ' / ' + total;
  if ($('#autoGenerateProgressBar')) $('#autoGenerateProgressBar').style.width = pct + '%';

  const parts = [];
  if (autoBatchState.running) {
    parts.push('运行 ' + autoBatchState.active);
    parts.push('已提交 ' + autoBatchState.submitted);
    parts.push('成功 ' + autoBatchState.completed);
    parts.push('失败 ' + autoBatchState.failed);
  }
  if (detail) parts.push(detail);
  if ($('#autoGenerateDetail')) {
    $('#autoGenerateDetail').textContent = parts.join(' · ') || '应用、素材与生成参数均以当前页面为准。批量运行时请保持工作台页面打开。';
  }

  syncAutoGenerateAvailability();
}

function createBatchId() {
  return 'batch-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function snapshotAutoBatchConfig(total, concurrency) {
  const appKey = state.activeApp;
  if (!isVideoAppKey(appKey)) throw new Error('自动生成仅支持视频应用');

  const mediaMap = currentBatchMediaMap(appKey);
  const files = Object.entries(state.files)
    .filter(([slot,file]) => !!mediaMap[slot] && !!file)
    .map(([slot,file]) => ({slot,file}));

  const snapshot = {
    appKey,
    appId:APPS[appKey].appId,
    appName:APPS[appKey].name,
    instanceType:$('#instanceType').value || 'default',
    mediaMap,
    files,
    total,
    concurrency
  };

  if (appKey === APP_KEYS.video) {
    snapshot.aspect = $('#aspectRatio').value;
    snapshot.quality = $('#qualityPreset').value;
    snapshot.duration = $('#durationRange').value;
  } else {
    snapshot.aspect = $('#multiFastAspectRatio').value;
  }

  return snapshot;
}

async function uploadAutoBatchMaterials(snapshot) {
  const uploadValues = {};
  if (!snapshot.files.length) return uploadValues;

  let done = 0;
  updateAutoBatchProgress('上传批量素材', '0 / ' + snapshot.files.length);

  for (const item of snapshot.files) {
    if (autoBatchState.stopRequested) throw new Error('批量任务已停止');
    uploadValues[item.slot] = await uploadFile(item.file, apiKey());
    done++;
    updateAutoBatchProgress('上传批量素材', done + ' / ' + snapshot.files.length);
  }

  return uploadValues;
}

function buildAutoBatchNodes(snapshot, prompt, uploadValues) {
  const nodes = [
    {nodeId:'150',fieldName:'value',fieldValue:prompt,description:null},
    {nodeId:'115',fieldName:'aspect_ratio',fieldValue:snapshot.aspect,description:null}
  ];

  if (snapshot.appKey === APP_KEYS.video) {
    nodes.push(
      {nodeId:'171',fieldName:'value',fieldValue:'false',description:null},
      {nodeId:'163',fieldName:'value',fieldValue:'false',description:null},
      {nodeId:'185',fieldName:'value',fieldValue:'false',description:null},
      {nodeId:'186',fieldName:'value',fieldValue:String(snapshot.duration || '10'),description:null},
      {nodeId:'147',fieldName:'value',fieldValue:String(snapshot.quality || '0.9'),description:null},
      {nodeId:'192',fieldName:'value',fieldValue:'8',description:null},
      {nodeId:'159',fieldName:'lora_name',fieldValue:'MysticXXX_MMH3-V1.safetensors',description:null},
      {nodeId:'159',fieldName:'strength_model',fieldValue:'0.4',description:null},
      {nodeId:'169',fieldName:'value',fieldValue:'false',description:null},
      {nodeId:'158',fieldName:'value',fieldValue:'false',description:null}
    );
  } else {
    nodes.push(...getMultiFastFixedNodes());
  }

  for (const [slot,config] of Object.entries(snapshot.mediaMap)) {
    nodes.push({
      nodeId:config.nodeId,
      fieldName:config.fieldName,
      fieldValue:uploadValues[slot] || 'None',
      description:null
    });
  }

  return nodes;
}

function autoBatchHistoryMeta(snapshot, index, promptResult) {
  return {
    createdAt:Date.now(),
    aspect:(snapshot.aspect || '').split(' ')[0],
    quality:snapshot.appKey === APP_KEYS.video ? qualityLabel(snapshot.quality) : '加速版 · V2',
    duration:snapshot.appKey === APP_KEYS.video ? String(snapshot.duration || '10') + 's' : '',
    instance:instanceLabel(snapshot.instanceType),
    prompt:String(promptResult.prompt || '').slice(0,120),
    batchId:autoBatchState.batchId,
    batchIndex:index,
    batchTotal:snapshot.total,
    personaSeed:promptResult.personaSeed || '',
    personaId:promptResult.personaId || '',
    personaName:promptResult.personaName || '',
    actionCount:Number(promptResult.actionCount || 0),
    signatureCount:Number(promptResult.signatureCount || 0),
    arc:promptResult.arc || '',
    clothesSeed:promptResult.personaSeed || '',
    performanceSeed:promptResult.personaSeed || ''
  };
}

async function waitForAutoBatchTask(snapshot, taskId, meta) {
  while (true) {
    await sleep(3000);
    const data = await queryRH(taskId);
    upsertHistory(snapshot.appKey, data, meta);

    const status = String(data.status || '').toUpperCase();
    if (status === 'SUCCESS' || status === 'FAILED') return data;
  }
}

async function runAutoBatchItem(snapshot, uploadValues, index) {
  const generator = window.RHPromptGenerator;
  if (!generator?.generateRandom) throw new Error('提示词随机生成器未就绪');

  const promptResult = generator.generateRandom();
  if (!promptResult.personaSeed || !promptResult.personaId) {
    throw new Error('Persona 联动随机生成失败，无法执行批量任务');
  }
  if (!promptResult.action || !promptResult.performance || !promptResult.clothes) {
    throw new Error('提示词模板需要 {{clothes}}、{{performance}}、{{action}} 三个联动变量');
  }
  const nodes = buildAutoBatchNodes(snapshot, promptResult.prompt, uploadValues);
  const meta = autoBatchHistoryMeta(snapshot, index, promptResult);

  const data = await runRHApp(snapshot.appId, nodes, {instanceType:snapshot.instanceType});
  autoBatchState.submitted++;
  upsertHistory(snapshot.appKey, data, meta);
  updateAutoBatchProgress('批量生成中', '第 ' + index + ' 条已提交');

  const status = String(data.status || '').toUpperCase();
  if (status === 'SUCCESS' || status === 'FAILED') return data;
  return waitForAutoBatchTask(snapshot, data.taskId, meta);
}

async function autoBatchWorker(snapshot, uploadValues) {
  while (!autoBatchState.stopRequested) {
    const index = autoBatchState.nextIndex++;
    if (index > snapshot.total) return;

    autoBatchState.active++;
    updateAutoBatchProgress('批量生成中', '处理第 ' + index + ' 条');

    try {
      const result = await runAutoBatchItem(snapshot, uploadValues, index);
      if (String(result.status || '').toUpperCase() === 'SUCCESS') {
        autoBatchState.completed++;
      } else {
        autoBatchState.failed++;
      }
    } catch (error) {
      autoBatchState.failed++;
      autoBatchState.lastError = error?.message || '批量任务失败';

      // A submit/query infrastructure failure can make concurrency accounting unreliable.
      // Stop adding new tasks, but let already-created workers finish naturally.
      autoBatchState.stopRequested = true;
    } finally {
      autoBatchState.active--;
      updateAutoBatchProgress(
        autoBatchState.stopRequested ? '正在停止' : '批量生成中',
        autoBatchState.lastError || ''
      );
    }
  }
}

async function startAutoGenerate() {
  if (autoBatchState.running) return;

  if (!apiKey()) {
    toast('请先在设置中保存 RunningHub API Key','bad');
    openSettings();
    return;
  }

  if (!isVideoAppKey(state.activeApp)) {
    toast('自动生成仅支持视频应用','bad');
    return;
  }

  if (autoBatchHasManualVideoTask()) {
    toast('当前还有单条视频任务在运行，请完成后再启动批量生成','bad');
    return;
  }

  const total = Math.trunc(Number($('#autoGenerateTotal').value));
  const concurrency = Math.trunc(Number($('#autoGenerateConcurrency').value));

  if (!Number.isFinite(total) || total < 1) {
    toast('总生成数量必须是大于 0 的整数','bad');
    $('#autoGenerateTotal').focus();
    return;
  }

  if (![1,2].includes(concurrency)) {
    toast('并发数量只能设置为 1 或 2','bad');
    return;
  }

  if (!window.RHPromptGenerator?.generateRandom) {
    toast('提示词随机生成器尚未加载','bad');
    return;
  }

  const snapshot = snapshotAutoBatchConfig(total, concurrency);

  autoBatchState.running = true;
  autoBatchState.stopRequested = false;
  autoBatchState.batchId = createBatchId();
  autoBatchState.appKey = snapshot.appKey;
  autoBatchState.total = total;
  autoBatchState.concurrency = concurrency;
  autoBatchState.submitted = 0;
  autoBatchState.completed = 0;
  autoBatchState.failed = 0;
  autoBatchState.active = 0;
  autoBatchState.nextIndex = 1;
  autoBatchState.startedAt = Date.now();
  autoBatchState.lastError = '';
  autoBatchState.downloading = false;

  setAutoBatchControlsLocked(true);
  updateAutoBatchProgress('准备批量生成', '冻结当前素材与参数');

  try {
    const uploadValues = await uploadAutoBatchMaterials(snapshot);
    if (autoBatchState.stopRequested) throw new Error('批量任务已停止');

    const workers = Array.from(
      {length:Math.min(concurrency, total)},
      () => autoBatchWorker(snapshot, uploadValues)
    );
    await Promise.all(workers);
  } catch (error) {
    autoBatchState.lastError = error?.message || '批量生成失败';
  } finally {
    const finished = autoBatchState.completed + autoBatchState.failed;
    const stopped = autoBatchState.stopRequested && finished < total;

    autoBatchState.running = false;
    setAutoBatchControlsLocked(false);
    updateAutoBatchProgress(
      stopped ? '批量已停止' : (autoBatchState.failed ? '批量完成 · 有失败' : '批量完成'),
      autoBatchState.lastError || ('批次 ' + autoBatchState.batchId)
    );

    if (stopped) {
      toast('已停止新增任务，已提交的任务已处理完');
    } else if (autoBatchState.failed) {
      toast('批量生成结束，存在失败任务','bad');
    } else {
      toast('批量生成完成','good');
    }
  }
}

function stopAutoGenerate() {
  if (!autoBatchState.running) return;
  autoBatchState.stopRequested = true;
  $('#stopAutoGenerate').disabled = true;
  updateAutoBatchProgress('正在停止', '不会再提交新任务，已提交任务继续完成');
}

$('#startAutoGenerate').onclick = startAutoGenerate;
$('#downloadCurrentBatch').onclick = downloadCurrentBatchArchive;
$('#stopAutoGenerate').onclick = stopAutoGenerate;
$('#autoGenerateTotal').addEventListener('input', syncAutoGenerateAvailability);
$('#autoGenerateConcurrency').addEventListener('change', syncAutoGenerateAvailability);

window.addEventListener('beforeunload', event => {
  if (!autoBatchState.running) return;
  event.preventDefault();
  event.returnValue = '';
});

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
$('#skinUpscaleRunBtn').onclick = runSkinUpscaleTask;
$('#skinUpscaleDownloadBtn').onclick = () => triggerDownload(skinUpscaleState, $('#skinUpscaleDownloadBtn'), 'rh-studio-skin-upscale');
$('#qwenMultiEditRunBtn').onclick = runQwenMultiEditTask;
$('#qwenMultiEditDownloadBtn').onclick = () => triggerDownload(qwenMultiEditState, $('#qwenMultiEditDownloadBtn'), 'rh-studio-qwen-image-2-1-edit');
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
  restoreRuntimeTasks('');
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
    LS.multiFastPrompt,
    LS.multiFastAspect,
    LS.qwenMultiEditPrompt,
    LS.qwenMultiEditAspect,
    LS.qwenMultiEditQuality,
    LS.qwenMultiEditCount,
    LS.appFilter,
    LS.inst,
    LS.runtimeTasks
  ].forEach(k => localStorage.removeItem(k));

  Object.keys(state.files).forEach(slot => clearFile(slot));
  loadConfig();
  renderVideoIdle();
  renderImageIdle();
  renderWhiteMarbleIdle();
  renderKQ12Idle();
  renderSkinUpscaleIdle();
  clearSkinUpscaleFile();
  renderQwenMultiEditIdle();
  renderMultiFastIdle();
  renderAppFilter('all', false, false);
  setActiveApp(APP_KEYS.video);
  toast('本地应用配置已重置');
};

loadConfig();
updateKeyUI();
Object.keys(MEDIA).forEach(renderFileSlot);
Object.keys(MULTI_FAST_MEDIA).forEach(renderFileSlot);
Object.keys(QWEN_MULTI_EDIT_MEDIA).forEach(renderFileSlot);
ensureMaterialLibrary().catch(() => updateMaterialLibraryBadges());
renderVideoIdle();
renderImageIdle();
renderWhiteMarbleIdle();
renderKQ12Idle();
renderSkinUpscaleIdle();
renderSkinUpscaleInput();
renderQwenMultiEditIdle();
renderMultiFastIdle();
syncAutoGenerateAvailability();
updateAutoBatchProgress();

const params = new URLSearchParams(window.location.search);
const requestedApp = params.get('app');
const recoveryTaskId = params.get('task');
const initialApp = APPS[requestedApp]
  ? requestedApp
  : (APPS[localStorage.getItem(LS.active)] ? localStorage.getItem(LS.active) : APP_KEYS.video);

setActiveApp(initialApp, false);
renderAppFilter(state.appFilter, false, true);
restoreRuntimeTasks(recoveryTaskId ? initialApp : '');

window.addEventListener('pageshow', event => {
  if (event.persisted) restoreRuntimeTasks('');
});

if (recoveryTaskId) {
  const view = runtimeViews()[initialApp] || runtimeViews()[APP_KEYS.video];
  const snapshot = {
    taskId:recoveryTaskId,
    status:'RUNNING',
    results:[],
    errorCode:'',
    errorMessage:'',
    createdAt:Date.now(),
    updatedAt:Date.now()
  };

  view.state.task = snapshot;
  view.renderLoading('RUNNING', recoveryTaskId);
  saveRuntimeTask(initialApp, snapshot);

  if (!apiKey()) {
    toast('请先在设置中保存 API Key，再恢复任务', 'bad');
  } else {
    clearInterval(view.state.poll);
    view.state.poll = setInterval(() => view.query(recoveryTaskId), 3000);
    view.query(recoveryTaskId);
  }
}
