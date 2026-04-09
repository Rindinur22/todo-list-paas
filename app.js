// ===== DATA =====
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let currentFilter = 'all';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  updateStats();

  // Enter key support
  document.getElementById('taskInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });
});

// ===== SAVE TO LOCALSTORAGE =====
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ===== ADD TASK =====
function addTask() {
  const input = document.getElementById('taskInput');
  const hint  = document.getElementById('inputHint');
  const text  = input.value.trim();

  if (!text) {
    hint.textContent = '⚠️ Tugas tidak boleh kosong!';
    hint.classList.add('error');
    input.focus();
    setTimeout(() => {
      hint.textContent = 'Tekan Enter atau klik Tambah';
      hint.classList.remove('error');
    }, 2000);
    return;
  }

  const newTask = {
    id: Date.now(),
    text: text,
    done: false,
    createdAt: new Date().toLocaleDateString('id-ID', { day:'numeric', month:'short' })
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
  updateStats();

  input.value = '';
  hint.textContent = '✅ Tugas berhasil ditambahkan!';
  hint.classList.remove('error');
  setTimeout(() => {
    hint.textContent = 'Tekan Enter atau klik Tambah';
  }, 2000);
  input.focus();
}

// ===== TOGGLE DONE =====
function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks();
  renderTasks();
  updateStats();
}

// ===== DELETE TASK =====
function deleteTask(id) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (item) {
    item.classList.add('removing');
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
      updateStats();
    }, 280);
  }
}

// ===== CLEAR COMPLETED =====
function clearCompleted() {
  const doneTasks = document.querySelectorAll('.task-item.done');
  doneTasks.forEach(el => el.classList.add('removing'));
  setTimeout(() => {
    tasks = tasks.filter(t => !t.done);
    saveTasks();
    renderTasks();
    updateStats();
  }, 300);
}

// ===== FILTER =====
function filterTasks(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`filter-${filter}`).classList.add('active');
  renderTasks();
}

// ===== RENDER =====
function renderTasks() {
  const list  = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  const bottomBar = document.getElementById('bottomBar');

  // Filter tasks
  let filtered;
  if (currentFilter === 'done')    filtered = tasks.filter(t => t.done);
  else if (currentFilter === 'pending') filtered = tasks.filter(t => !t.done);
  else filtered = tasks;

  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.add('visible');
    const labels = { all: 'Belum ada tugas. Tambahkan sekarang!', done: 'Belum ada tugas yang selesai.', pending: 'Semua tugas sudah selesai! 🎉' };
    document.querySelector('.empty-sub').textContent = labels[currentFilter];
  } else {
    empty.classList.remove('visible');
  }

  filtered.forEach((task, index) => {
    const item = document.createElement('div');
    item.className = `task-item${task.done ? ' done' : ''}`;
    item.setAttribute('data-id', task.id);

    item.innerHTML = `
      <div class="task-check" onclick="toggleTask(${task.id})" title="${task.done ? 'Tandai belum selesai' : 'Tandai selesai'}">
        ${task.done ? '✓' : ''}
      </div>
      <div class="task-text">${escapeHtml(task.text)}</div>
      <span class="task-num">#${String(index + 1).padStart(2, '0')}</span>
      <button class="delete-btn" onclick="deleteTask(${task.id})" title="Hapus tugas">✕</button>
    `;

    list.appendChild(item);
  });

  // Show/hide clear button
  const hasDone = tasks.some(t => t.done);
  bottomBar.style.display = hasDone ? 'block' : 'none';
}

// ===== STATS =====
function updateStats() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.done).length;
  const pending = total - done;

  animateCount('totalCount', total);
  animateCount('doneCount', done);
  animateCount('pendingCount', pending);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;
  const step = target > current ? 1 : -1;
  let val = current;
  const interval = setInterval(() => {
    val += step;
    el.textContent = val;
    if (val === target) clearInterval(interval);
  }, 30);
}

// ===== HELPER =====
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
