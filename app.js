const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const LS = {
  key: 'rhstudio.apiKey',
  app: 'rhstudio.appId',
  inst: 'rhstudio.instanceType',
  queue: 'rhstudio.personalQueue',
  nodes: 'rhstudio.nodes'
};

const state = { rows: [], task: null, timer: null };
const uid = () => Math.random().toString(36).slice(2, 9);
const makeRow = (kind = 'text') => ({
  id: uid(),
  nodeId: '',
  fieldName: kind === 'file' ? 'image' : 'value',
  kind,
  value: '',
  file: null
});

const esc = (v = '') => String(v).replace(/[&<>"]/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
}[c]));

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

function getKey() {
  return localStorage.getItem(LS.key) || '';
}

function setRoute(route) {
  $('#workspacePage').classList.toggle('hidden', route !== 'workspace');
  $('#settingsPage').classList.toggle('hidden', route !== 'settings');
  $$('.nav-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.route === route));
}

function updateKeyUI() {
  const key = getKey();
  $('#keyWarning').classList.toggle('hidden', !!key);
  $('#keyStatusText').textContent = key ? '已保存 API Key' : '尚未保存';
  $('#keyMask').textContent = key ? `${key.slice(0, 4)} ········ ${key.slice(-4)}` : '';
}

function persist() {
  localStorage.setItem(LS.app, $('#appId').value.trim());
  localStorage.setItem(LS.inst, $('#instanceType').value);
  localStorage.setItem(LS.queue, $('#personalQueue').value);
  localStorage.setItem(LS.nodes, JSON.stringify(state.rows.map((r) => ({
    id: r.id,
    nodeId: r.nodeId,
    fieldName: r.fieldName,
    kind: r.kind,
    value: r.kind === 'file' ? '' : r.value
  }))));
}

function load() {
  $('#appId').value = localStorage.getItem(LS.app) || '';
  $('#instanceType').value = localStorage.getItem(LS.inst) || 'default';
  $('#personalQueue').value = localStorage.getItem(LS.queue) || 'false';
  try {
    const saved = JSON.parse(localStorage.getItem(LS.nodes) || '[]');
    state.rows = saved.length
      ? saved.map((r) => ({ ...makeRow(r.kind || 'text'), ...r, file: null }))
      : [makeRow('text')];
  } catch {
    state.rows = [makeRow('text')];
  }
}

function countNodes() {
  const count = state.rows.filter((r) => r.nodeId.trim() && r.fieldName.trim()).length;
  $('#nodeCount').textContent = `${count} 个有效节点`;
}

function renderNodes() {
  if (!state.rows.length) state.rows = [makeRow('text')];

  $('#nodes').innerHTML = state.rows.map((r, index) => `
    <div class="node" data-id="${r.id}">
      <span class="node-index">Node ${String(index + 1).padStart(2, '0')}</span>
      <input data-k="nodeId" placeholder="Node ID" value="${esc(r.nodeId)}" />
      <input data-k="fieldName" placeholder="fieldName" value="${esc(r.fieldName)}" />
      <select data-k="kind">
        <option value="text" ${r.kind === 'text' ? 'selected' : ''}>Text</option>
        <option value="number" ${r.kind === 'number' ? 'selected' : ''}>Number</option>
        <option value="boolean" ${r.kind === 'boolean' ? 'selected' : ''}>Boolean</option>
        <option value="file" ${r.kind === 'file' ? 'selected' : ''}>File</option>
      </select>
      ${r.kind === 'file'
        ? `<label class="filebox"><input type="file" data-k="file" hidden>${r.file ? esc(r.file.name) : '选择文件'}</label>`
        : `<input data-k="value" placeholder="fieldValue" value="${esc(r.value)}" />`
      }
      <button class="btn secondary danger remove" type="button">删除</button>
    </div>
  `).join('');

  $$('.node').forEach((node) => {
    const row = state.rows.find((r) => r.id === node.dataset.id);

    node.querySelector('.remove').onclick = () => {
      state.rows = state.rows.filter((r) => r.id !== row.id);
      renderNodes();
      persist();
    };

    node.querySelectorAll('[data-k]').forEach((input) => {
      const key = input.dataset.k;

      if (key === 'file') {
        input.parentElement.onclick = (e) => {
          if (e.target !== input) input.click();
        };
        input.onchange = () => {
          row.file = input.files?.[0] || null;
          renderNodes();
          persist();
        };
        return;
      }

      input.oninput = () => {
        row[key] = input.value;
        if (key === 'kind') {
          row.file = null;
          if (row.kind === 'file' && !row.fieldName) row.fieldName = 'image';
          renderNodes();
        }
        persist();
        countNodes();
      };
    });
  });

  countNodes();
}

function resultCard(item) {
  const type = (item.outputType || '').toLowerCase();
  const url = item.url || '';
  let preview = `<pre>${esc(item.text || type || 'OUTPUT')}</pre>`;

  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'].includes(type) && url) {
    preview = `<img src="${esc(url)}" alt="result" loading="lazy" />`;
  } else if (['mp4', 'webm', 'mov', 'm4v'].includes(type) && url) {
    preview = `<video src="${esc(url)}" controls playsinline preload="metadata"></video>`;
  } else if (['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(type) && url) {
    preview = `<audio src="${esc(url)}" controls preload="metadata"></audio>`;
  }

  const filename = `rh-output-node-${item.nodeId || 'result'}.${type || 'bin'}`;
  return `
    <article class="result-card">
      <div class="preview">${preview}</div>
      <div class="card-footer">
        <div class="card-meta">
          <b>Node ${esc(item.nodeId || '-')}</b>
          <span>${esc(type || 'output')}</span>
        </div>
        ${url ? `<a class="download-btn" href="${esc(url)}" download="${esc(filename)}" target="_blank" rel="noreferrer">↓ 下载</a>` : ''}
      </div>
    </article>
  `;
}

function renderTask() {
  const box = $('#resultArea');
  const status = $('#taskStatus');
  const task = state.task;

  if (!task) {
    status.textContent = '等待任务';
    box.innerHTML = '<div class="empty">暂无生成结果</div>';
    return;
  }

  status.textContent = `${task.status || '-'}${task.taskId ? ` · ${task.taskId}` : ''}`;

  if (task.status === 'FAILED') {
    box.innerHTML = `<div class="empty">${esc(task.errorMessage || '任务失败')}</div>`;
    return;
  }

  if (Array.isArray(task.results) && task.results.length) {
    box.innerHTML = task.results.map(resultCard).join('');
    return;
  }

  box.innerHTML = `<div class="empty">${task.status === 'SUCCESS' ? '任务完成，但没有返回可展示结果' : '任务处理中…'}</div>`;
}

async function uploadFile(file) {
  const res = await fetch('/api/rh/upload', {
    method: 'POST',
    headers: {
      'x-rh-key': getKey(),
      'x-file-name': encodeURIComponent(file.name),
      'x-file-type': file.type || 'application/octet-stream'
    },
    body: await file.arrayBuffer()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '文件上传失败');
  return data?.data?.fileName || data?.data?.download_url || data?.data?.url;
}

async function runWorkflow() {
  if (!getKey()) {
    setRoute('settings');
    return toast('请先配置 API Key');
  }

  const appId = $('#appId').value.trim();
  if (!appId) return toast('请填写 AI App ID');

  const rows = state.rows.filter((r) => r.nodeId.trim() && r.fieldName.trim());
  if (!rows.length) return toast('请至少添加一个有效节点');

  $('#runBtn').disabled = true;
  $('#runBtn').textContent = '运行中…';

  try {
    const nodeInfoList = [];

    for (const row of rows) {
      let value = row.value;
      if (row.kind === 'file') {
        if (!row.file) throw new Error(`节点 ${row.nodeId} 尚未选择文件`);
        toast(`正在上传 ${row.file.name}`);
        value = await uploadFile(row.file);
      }

      nodeInfoList.push({
        nodeId: row.nodeId.trim(),
        fieldName: row.fieldName.trim(),
        fieldValue: String(value ?? ''),
        description: null
      });
    }

    const res = await fetch('/api/rh/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-rh-key': getKey() },
      body: JSON.stringify({
        appId,
        nodeInfoList,
        instanceType: $('#instanceType').value,
        usePersonalQueue: $('#personalQueue').value
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '提交失败');

    state.task = data;
    renderTask();
    toast('任务已提交');

    clearInterval(state.timer);
    if (data.taskId && ['RUNNING', 'QUEUED'].includes(data.status)) {
      state.timer = setInterval(() => queryTask(data.taskId), 3000);
    }
  } catch (e) {
    toast(e.message || '执行失败');
  } finally {
    $('#runBtn').disabled = false;
    $('#runBtn').textContent = '运行工作流';
  }
}

async function queryTask(taskId) {
  const res = await fetch('/api/rh/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-rh-key': getKey() },
    body: JSON.stringify({ taskId })
  });

  const data = await res.json();
  if (!res.ok) {
    clearInterval(state.timer);
    state.timer = null;
    return toast(data.error || '查询失败');
  }

  state.task = data;
  renderTask();

  if (['SUCCESS', 'FAILED'].includes(data.status)) {
    clearInterval(state.timer);
    state.timer = null;
    toast(data.status === 'SUCCESS' ? '任务完成' : '任务失败');
  }
}

$$('.nav-btn').forEach((btn) => btn.onclick = () => setRoute(btn.dataset.route));
$('#addParam').onclick = () => { state.rows.push(makeRow('text')); renderNodes(); persist(); };
$('#addFile').onclick = () => { state.rows.push(makeRow('file')); renderNodes(); persist(); };
$('#runBtn').onclick = runWorkflow;

$('#saveKey').onclick = () => {
  const value = $('#apiKeyInput').value.trim();
  if (!value) return toast('请输入 API Key');
  localStorage.setItem(LS.key, value);
  $('#apiKeyInput').value = '';
  updateKeyUI();
  toast('API Key 已保存');
};

$('#clearKey').onclick = () => {
  localStorage.removeItem(LS.key);
  updateKeyUI();
  toast('API Key 已清除');
};

$('#toggleKey').onclick = () => {
  const input = $('#apiKeyInput');
  input.type = input.type === 'password' ? 'text' : 'password';
  $('#toggleKey').textContent = input.type === 'password' ? '显示' : '隐藏';
};

$('#clearLocal').onclick = () => {
  [LS.app, LS.inst, LS.queue, LS.nodes].forEach((k) => localStorage.removeItem(k));
  state.rows = [makeRow('text')];
  $('#appId').value = '';
  $('#instanceType').value = 'default';
  $('#personalQueue').value = 'false';
  renderNodes();
  toast('本地工作台数据已清除');
};

['appId', 'instanceType', 'personalQueue'].forEach((id) => {
  $('#' + id).oninput = persist;
  $('#' + id).onchange = persist;
});

load();
renderNodes();
updateKeyUI();
renderTask();