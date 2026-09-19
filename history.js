const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const LS = {
  key: 'rhstudio.apiKey',
  history: 'rhstudio.generationHistory'
};

let activeFilter = 'ALL';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[c]));

function toast(message, type='') {
  const el = $('#toast');
  el.textContent = message;
  el.className = 'toast show ' + type;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.className = 'toast', 2400);
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

function statusText(status) {
  return {
    SUCCESS:'已完成',
    FAILED:'失败',
    RUNNING:'生成中',
    QUEUED:'排队中'
  }[status] || status || '未知';
}

function formatTime(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('zh-CN',{
      year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit'
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

function mergeTaskResult(taskId, data, fallback={}) {
  const items = getHistory();
  const prev = items.find(x => x.taskId === taskId) || {};
  const results = Array.isArray(data?.results) ? data.results : [];
  const primary = results.find(x => String(x?.outputType || '').toLowerCase().includes('mp4')) || results[0] || null;

  const next = {
    ...prev,
    ...fallback,
    taskId,
    status:data?.status || prev.status || 'RUNNING',
    createdAt:prev.createdAt || fallback.createdAt || Date.now(),
    updatedAt:Date.now(),
    resultUrl:primary?.url || prev.resultUrl || '',
    outputType:primary?.outputType || prev.outputType || '',
    errorCode:data?.errorCode || prev.errorCode || '',
    errorMessage:data?.errorMessage || prev.errorMessage || ''
  };

  saveHistory([next, ...items.filter(x => x.taskId !== taskId)]);
  return next;
}

async function queryTask(taskId) {
  const key = apiKey();
  if (!key) throw new Error('请先返回工作台配置 RunningHub API Key');

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

function updateSummary(items) {
  $('#historyCount').textContent = items.length;
  $('#historySuccessCount').textContent = items.filter(x => x.status === 'SUCCESS').length;
  $('#historyRunningCount').textContent = items.filter(x => ['RUNNING','QUEUED'].includes(x.status)).length;
  $('#historyFailedCount').textContent = items.filter(x => x.status === 'FAILED').length;
}

function renderHistory() {
  const all = getHistory();
  updateSummary(all);

  const items = activeFilter === 'ALL'
    ? all
    : activeFilter === 'RUNNING'
      ? all.filter(x => ['RUNNING','QUEUED'].includes(x.status))
      : all.filter(x => x.status === activeFilter);

  const list = $('#historyList');

  if (!items.length) {
    list.innerHTML =
      '<div class="history-page-empty">' +
        '<div>↺</div>' +
        '<strong>没有符合条件的任务</strong>' +
        '<span>可以从工作台生成，或通过上方 Task ID 导入。</span>' +
      '</div>';
    return;
  }

  list.innerHTML = items.map(item => {
    const statusClass = String(item.status || '').toLowerCase();
    const prompt = item.prompt ? esc(item.prompt) : '未保存提示词摘要';
    const err = item.errorMessage ? '<div class="history-card-error">' + esc(item.errorMessage) + '</div>' : '';

    return (
      '<article class="history-card">' +
        '<div class="history-card-main">' +
          '<div class="history-card-top">' +
            '<div>' +
              '<span class="history-card-time">' + esc(formatTime(item.createdAt)) + '</span>' +
              '<h3>' + prompt + '</h3>' +
            '</div>' +
            '<i class="history-card-status ' + esc(statusClass) + '">' + esc(statusText(item.status)) + '</i>' +
          '</div>' +

          '<div class="history-card-meta">' +
            '<span><b>比例</b>' + esc(item.aspect || '—') + '</span>' +
            '<span><b>清晰度</b>' + esc(item.quality || '—') + '</span>' +
            '<span><b>时长</b>' + esc(item.duration || '—') + '</span>' +
            '<span><b>实例</b>' + esc(item.instance || '—') + '</span>' +
          '</div>' +

          '<div class="history-card-task">TASK · ' + esc(item.taskId) + '</div>' +
          err +
        '</div>' +

        '<div class="history-card-actions">' +
          '<button type="button" data-sync-task="' + esc(item.taskId) + '">同步</button>' +
          '<a href="/?task=' + encodeURIComponent(item.taskId) + '">' +
            (item.status === 'SUCCESS' ? '载入结果' : '查看任务') +
          '</a>' +
          '<button class="danger" type="button" data-delete-task="' + esc(item.taskId) + '">删除</button>' +
        '</div>' +
      '</article>'
    );
  }).join('');
}

async function importTask() {
  const input = $('#historyTaskInput');
  const taskId = String(input.value || '').trim();

  if (!taskId) {
    toast('请输入 RunningHub Task ID','bad');
    input.focus();
    return;
  }

  if (!/^\d{10,}$/.test(taskId)) {
    toast('Task ID 格式不正确','bad');
    input.focus();
    return;
  }

  const btn = $('#importHistoryTask');
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = '查询中…';

  try {
    const data = await queryTask(taskId);
    mergeTaskResult(taskId,data,{createdAt:Date.now()});
    input.value = '';
    renderHistory();
    toast('任务已导入','good');
  } catch (error) {
    toast(error?.message || '导入失败','bad');
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}

async function syncOne(taskId, button) {
  const old = button?.textContent;
  if (button) {
    button.disabled = true;
    button.textContent = '同步中…';
  }

  try {
    const data = await queryTask(taskId);
    mergeTaskResult(taskId,data);
    renderHistory();
    toast('任务状态已更新','good');
  } catch (error) {
    toast(error?.message || '同步失败','bad');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = old || '同步';
    }
  }
}

async function syncAll() {
  const items = getHistory();
  if (!items.length) {
    toast('暂无任务记录');
    return;
  }

  const btn = $('#syncHistory');
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = '同步中…';

  let updated = 0;
  try {
    for (const item of items.slice(0,20)) {
      try {
        const data = await queryTask(item.taskId);
        mergeTaskResult(item.taskId,data);
        updated++;
      } catch {}
    }
    renderHistory();
    toast('已同步 ' + updated + ' 条任务','good');
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}

function deleteTask(taskId) {
  saveHistory(getHistory().filter(x => x.taskId !== taskId));
  renderHistory();
  toast('记录已删除');
}

function updateApiState() {
  const el = $('#historyApiState');
  const ok = !!apiKey();
  el.classList.toggle('ok',ok);
  el.querySelector('b').textContent = ok ? 'READY' : 'MISSING';
}

$('#importHistoryTask').onclick = importTask;
$('#historyTaskInput').addEventListener('keydown',e => {
  if (e.key === 'Enter') importTask();
});

$('#syncHistory').onclick = syncAll;

$('#clearHistory').onclick = () => {
  if (!getHistory().length) return;
  if (!confirm('确认清空当前浏览器里的所有生成记录？')) return;
  localStorage.removeItem(LS.history);
  renderHistory();
  toast('生成记录已清空');
};

$('#historyList').addEventListener('click',e => {
  const syncBtn = e.target.closest('[data-sync-task]');
  if (syncBtn) {
    syncOne(syncBtn.dataset.syncTask,syncBtn);
    return;
  }

  const deleteBtn = e.target.closest('[data-delete-task]');
  if (deleteBtn) {
    deleteTask(deleteBtn.dataset.deleteTask);
  }
});

$$('.history-filter-btn').forEach(btn => {
  btn.onclick = () => {
    activeFilter = btn.dataset.filter;
    $$('.history-filter-btn').forEach(x => x.classList.toggle('active',x === btn));
    renderHistory();
  };
});

updateApiState();
renderHistory();
