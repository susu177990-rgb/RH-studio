const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const APP_ID = '2084320751339032577';
const RH_UPLOAD_DIRECT = 'https://www.runninghub.ai/openapi/v2/media/upload/binary';
const MAX_RH_UPLOAD_BYTES = 30 * 1024 * 1024;

const LS = {
  key: 'rhstudio.apiKey',
  app: 'rhstudio.appId',
  prompt: 'rhstudio.prompt',
  aspect: 'rhstudio.aspectRatio',
  quality: 'rhstudio.qualityPreset',
  duration: 'rhstudio.duration',
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
  files: {},
  objectUrls: {},
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
  localStorage.setItem(LS.duration, $('#durationRange').value);
  localStorage.setItem(LS.inst, $('#instanceType').value);
}

function loadConfig() {
  $('#appId').value = localStorage.getItem(LS.app) || APP_ID;
  $('#promptInput').value = localStorage.getItem(LS.prompt) || '';
  $('#aspectRatio').value = localStorage.getItem(LS.aspect) || '9:16 (Portrait Widescreen)';
  $('#qualityPreset').value = localStorage.getItem(LS.quality) || '0.9';
  $('#durationRange').value = localStorage.getItem(LS.duration) || '10';
  $('#instanceType').value = localStorage.getItem(LS.inst) || 'default';
  updateDurationUI();
  updatePromptCount();
  updateRatioChip();
}

['appId','promptInput','aspectRatio','qualityPreset','durationRange','instanceType'].forEach(id => {
  const el = $('#' + id);
  el.addEventListener('input', () => {
    persist();
    if (id === 'promptInput') updatePromptCount();
    if (id === 'aspectRatio') updateRatioChip();
    if (id === 'durationRange') updateDurationUI();
  });
  el.addEventListener('change', () => {
    persist();
    if (id === 'aspectRatio') updateRatioChip();
  });
});

function updateDurationUI() {
  const range = $('#durationRange');
  const value = Number(range.value || 10);
  $('#durationValue').textContent = value + 's';
  const pct = ((value - Number(range.min)) / (Number(range.max) - Number(range.min))) * 100;
  range.style.background = 'linear-gradient(90deg,var(--accent) ' + pct + '%,rgba(255,255,255,.08) ' + pct + '%)';
}

function updatePromptCount() {
  $('#promptCount').textContent = String($('#promptInput').value.length);
}

function updateRatioChip() {
  const el = $('#ratioChip');
  if (!el) return;
  const value = $('#aspectRatio').value || '';
  el.textContent = value.split(' ')[0] || '9:16';
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
  try {
    localStorage.setItem(LS.history, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

function qualityLabel(value) {
  const map = {'0.4':'480P','0.9':'720P','2.0':'1080P'};
  return map[String(value)] || String(value || '');
}

function instanceLabel(value) {
  const map = {default:'24G',plus:'48G',ultra:'84G'};
  return map[value] || value || '24G';
}

function upsertHistory(task, extra={}) {
  const taskId = String(task?.taskId || extra.taskId || '').trim();
  if (!taskId) return;

  const items = getHistory();
  const previous = items.find(item => item.taskId === taskId) || {};
  const results = Array.isArray(task?.results) ? task.results : [];
  const primary = results.find(isVideo) || results.find(isImage) || results[0] || null;

  const next = {
    ...previous,
    taskId,
    status: task?.status || extra.status || previous.status || 'RUNNING',
    createdAt: previous.createdAt || extra.createdAt || Date.now(),
    updatedAt: Date.now(),
    aspect: extra.aspect || previous.aspect || ($('#aspectRatio')?.value || '').split(' ')[0],
    quality: extra.quality || previous.quality || qualityLabel($('#qualityPreset')?.value),
    duration: extra.duration || previous.duration || (($('#durationRange')?.value || '10') + 's'),
    instance: extra.instance || previous.instance || instanceLabel($('#instanceType')?.value),
    prompt: extra.prompt ?? previous.prompt ?? ($('#promptInput')?.value || '').trim().slice(0, 120),
    resultUrl: primary?.url || previous.resultUrl || '',
    outputType: primary?.outputType || previous.outputType || '',
    errorMessage: task?.errorMessage || previous.errorMessage || ''
  };

  saveHistory([next, ...items.filter(item => item.taskId !== taskId)]);
  if (!$('#historyOverlay')?.classList.contains('hidden')) renderHistory();
}

function historyStatusText(status) {
  return {
    QUEUED:'排队中',
    RUNNING:'生成中',
    SUCCESS:'已完成',
    FAILED:'失败'
  }[status] || status || '未知';
}

function formatHistoryTime(value) {
  try {
    return new Intl.DateTimeFormat('zh-CN',{
      month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'
    }).format(new Date(value));
  } catch {
    return '';
  }
}

function renderHistory() {
  const list = $('#historyList');
  if (!list) return;

  const items = getHistory();
  if (!items.length) {
    list.innerHTML =
      '<div class="history-empty">' +
        '<strong>还没有生成记录</strong>' +
        '<span>提交任务后会自动出现在这里。</span>' +
      '</div>';
    return;
  }

  list.innerHTML = items.map(item => {
    const statusClass = String(item.status || '').toLowerCase();
    const prompt = item.prompt ? esc(item.prompt) : '未保存提示词摘要';
    const canLoad = item.taskId ? '' : ' disabled';
    return (
      '<article class="history-item">' +
        '<div class="history-item-head">' +
          '<div>' +
            '<span>' + esc(formatHistoryTime(item.createdAt)) + '</span>' +
            '<strong>' + esc(prompt) + '</strong>' +
          '</div>' +
          '<i class="history-status ' + esc(statusClass) + '">' + esc(historyStatusText(item.status)) + '</i>' +
        '</div>' +
        '<div class="history-meta">' +
          '<span>' + esc(item.aspect || '—') + '</span>' +
          '<span>' + esc(item.quality || '—') + '</span>' +
          '<span>' + esc(item.duration || '—') + '</span>' +
          '<span>' + esc(item.instance || '—') + '</span>' +
        '</div>' +
        '<div class="history-task">TASK · ' + esc(item.taskId) + '</div>' +
        '<button class="history-load" type="button" data-history-task="' + esc(item.taskId) + '"' + canLoad + '>' +
          (item.status === 'SUCCESS' ? '载入结果' : '查看任务') +
          '<b>↗</b>' +
        '</button>' +
      '</article>'
    );
  }).join('');
}

function closeDrawers() {
  $('.drawer-overlay').forEach(el => el.classList.add('hidden'));
  document.body.style.overflow = '';
}

function openSettings() {
  closeDrawers();
  $('#apiKeyInput').value = '';
  $('#settingsOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function openHistory() {
  window.location.href = '/history';
}

$('#openSettings').onclick = openSettings;
$('#openHistory').onclick = openHistory;
$('[data-close],[data-close-history]').forEach(el => el.onclick = closeDrawers);
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

      const reason =
        directError?.message ||
        rewriteError?.message ||
        '未知上传错误';

      throw new Error('文件直传 RunningHub 失败：' + reason);
    }
  }
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

function setDownload(url='', type='') {
  state.outputSourceUrl = url || '';
  state.outputUrl = toMediaUrl(url || '');
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
  const mediaUrl = toMediaUrl(url);
  const type = String(primary.outputType || 'output').toLowerCase();
  setDownload(url, type);

  if (isVideo(primary) && url) {
    $('#resultArea').innerHTML = '<video src="' + esc(mediaUrl) + '" controls playsinline preload="metadata"></video>';
    const video = $('#resultArea video');
    if (video) {
      video.addEventListener('error', () => {
        const code = video.error?.code || '';
        toast('视频已生成，但浏览器加载失败' + (code ? ' · MEDIA_ERR_' + code : ''), 'bad');
      }, { once:true });
    }
  } else if (isImage(primary) && url) {
    $('#resultArea').innerHTML = '<img src="' + esc(mediaUrl) + '" alt="generated output">';
  } else if (primary.text) {
    $('#resultArea').innerHTML = '<div class="file-state"><strong>' + esc(primary.text) + '</strong></div>';
  } else {
    $('#resultArea').innerHTML = '<div class="file-state"><strong>' + esc(type.toUpperCase()) + '</strong></div>';
  }
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
      return text.length > 3600 ? text.slice(0, 3600) + '\n…' : text;
    } catch {}
  }
  const text = String(parsed);
  return text.length > 3600 ? text.slice(0, 3600) + '\n…' : text;
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

    for (const [key, val] of Object.entries(value)) {
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

function renderFailed(task, message) {
  setStatus('FAILED', task?.taskId ? ('TASK · ' + task.taskId) : 'ERROR');
  setDownload();

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

  $('#resultArea').innerHTML =
    '<div class="error-state diagnostic-error">' +
      '<div class="empty-mark">!</div>' +
      '<strong>生成失败</strong>' +
      '<span class="failure-message">' + esc(errorMessage) + '</span>' +
      (details ? '<div class="failure-diagnostics">' + details + '</div>' : '') +
    '</div>';
}

function getFixedNodeInfo() {
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
        instanceType:$('#instanceType').value || 'default',
        usePersonalQueue:'false'
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || ('提交失败 (' + res.status + ')'));

    state.task = data;
    upsertHistory(data,{
      createdAt:Date.now(),
      aspect:($('#aspectRatio').value || '').split(' ')[0],
      quality:qualityLabel($('#qualityPreset').value),
      duration:($('#durationRange').value || '10') + 's',
      instance:instanceLabel($('#instanceType').value),
      prompt:prompt.slice(0,120)
    });
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
    upsertHistory(data,{taskId});

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
    const ext = (state.outputType || 'mp4').replace(/[^a-z0-9]/gi,'') || 'mp4';
    const a = document.createElement('a');
    a.href = state.outputUrl;
    a.download = 'rh-studio-output.' + ext;
    a.rel = 'noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('已开始下载','good');
  } catch {
    const fallback = state.outputSourceUrl || state.outputUrl;
    window.open(fallback, '_blank', 'noopener,noreferrer');
    toast('下载失败，已打开原文件','bad');
  } finally {
    setTimeout(() => {
      btn.disabled = !state.outputUrl;
      btn.innerHTML = original;
    }, 450);
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
  [LS.app,LS.prompt,LS.aspect,LS.quality,LS.duration,LS.inst].forEach(k => localStorage.removeItem(k));
  Object.keys(state.files).forEach(slot => clearFile(slot));
  loadConfig();
  renderIdle();
  toast('本地应用配置已重置');
};

$('#clearHistory').onclick = () => {
  localStorage.removeItem(LS.history);
  renderHistory();
  toast('生成记录已清空');
};

async function importHistoryTask() {
  const input = $('#historyTaskInput');
  const taskId = String(input?.value || '').trim();
  if (!taskId) {
    toast('请输入 RunningHub Task ID', 'bad');
    input?.focus();
    return;
  }
  if (!/^\d{10,}$/.test(taskId)) {
    toast('Task ID 格式不正确', 'bad');
    input?.focus();
    return;
  }
  if (!apiKey()) {
    closeDrawers();
    openSettings();
    toast('请先配置 RunningHub API Key', 'bad');
    return;
  }

  const button = $('#importHistoryTask');
  const original = button.textContent;
  button.disabled = true;
  button.textContent = '查询中…';

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

    upsertHistory(data,{taskId,createdAt:Date.now()});
    input.value = '';
    renderHistory();
    toast('任务已加入生成记录', 'good');
  } catch (error) {
    toast(error?.message || '导入任务失败', 'bad');
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

$('#importHistoryTask').onclick = importHistoryTask;
$('#historyTaskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') importHistoryTask();
});

$('#historyList').addEventListener('click', e => {
  const button = e.target.closest('[data-history-task]');
  if (!button) return;
  const taskId = button.dataset.historyTask;
  if (!taskId) return;

  if (!apiKey()) {
    closeDrawers();
    openSettings();
    toast('请先配置 RunningHub API Key', 'bad');
    return;
  }

  closeDrawers();
  renderLoading('RUNNING', taskId);
  queryTask(taskId);
});

loadConfig();
updateKeyUI();
Object.keys(MEDIA).forEach(renderFileSlot);

const recoveryTaskId = new URLSearchParams(window.location.search).get('task');
if (recoveryTaskId && apiKey()) {
  renderLoading('RUNNING', recoveryTaskId);
  queryTask(recoveryTaskId);
} else {
  renderIdle();
  if (recoveryTaskId && !apiKey()) {
    toast('请先在设置中保存 API Key，再打开任务恢复链接', 'bad');
  }
}
