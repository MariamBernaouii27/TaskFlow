const draftKey  = 'taskflow_draft';
const tasksKey  = 'taskflow_tasks';

let currentStatusFilter   = 'all';
let currentPriorityFilter = 'all';
let currentSearch         = '';
let currentPage           = 1;
const ITEMS_PER_PAGE      = 5;

const taskForm          = document.getElementById('taskForm');
const taskIdInput       = document.getElementById('taskId');
const titleInput        = document.getElementById('title');
const descriptionInput  = document.getElementById('description');
const priorityInput     = document.getElementById('priority');
const validationMessage = document.getElementById('validationMessage');
const taskList          = document.getElementById('taskList');
const submitBtn         = document.getElementById('submitBtn');
const cancelBtn         = document.getElementById('cancelBtn');
const formTitle         = document.getElementById('formTitle');
const searchInput       = document.getElementById('searchInput');
const resultsCount      = document.getElementById('resultsCount');
const paginationDiv     = document.getElementById('pagination');

let tasks = JSON.parse(localStorage.getItem(tasksKey)) || [];

document.addEventListener('DOMContentLoaded', () => {
  const savedDraft = localStorage.getItem(draftKey);
  if (savedDraft) {
    const confirmRestore = confirm('Nous avons trouvé un brouillon non sauvegardé. Voulez-vous le restaurer ?');
    if (confirmRestore) {
      const draftData = JSON.parse(savedDraft);
      titleInput.value       = draftData.title       || '';
      descriptionInput.value = draftData.description || '';
      priorityInput.value    = draftData.priority    || 'medium';
    } else {
      localStorage.removeItem(draftKey);
    }
  }
  renderTasks();
});

taskForm.addEventListener('input', () => {
  if (taskIdInput.value !== '') return;
  const taskData = {
    title:       titleInput.value,
    description: descriptionInput.value,
    priority:    priorityInput.value
  };
  localStorage.setItem(draftKey, JSON.stringify(taskData));
});

searchInput.addEventListener('input', () => {
  currentSearch = searchInput.value.trim().toLowerCase();
  currentPage   = 1;
  renderTasks();
});

document.getElementById('statusFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('#statusFilters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentStatusFilter = btn.dataset.status;
  currentPage         = 1;
  renderTasks();
});

document.getElementById('priorityFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('#priorityFilters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentPriorityFilter = btn.dataset.priority;
  currentPage           = 1;
  renderTasks();
});

function showMessage(text, type) {
  validationMessage.textContent = text;
  validationMessage.className   = `message ${type}`;
  validationMessage.style.display = 'block';
  setTimeout(() => { validationMessage.style.display = 'none'; }, 3000);
}

function getFilteredTasks() {
  return tasks.filter(task => {
    const statusMatch   = currentStatusFilter === 'all' || task.status === currentStatusFilter;
    const priorityMatch = currentPriorityFilter === 'all' || task.priority === currentPriorityFilter;
    const keyword       = currentSearch;
    const searchMatch   = !keyword ||
      task.title.toLowerCase().includes(keyword) ||
      (task.description || '').toLowerCase().includes(keyword);
    return statusMatch && priorityMatch && searchMatch;
  });
}

function renderTasks() {
  taskList.innerHTML      = '';
  paginationDiv.innerHTML = '';

  const filtered = getFilteredTasks();
  const total    = filtered.length;

  resultsCount.textContent = total === 0
    ? 'Aucune tâche ne correspond à vos filtres.'
    : `Affichage ${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, total)}–${Math.min(currentPage * ITEMS_PER_PAGE, total)} sur ${total} tâche${total !== 1 ? 's' : ''}`;

  if (total === 0) {
    taskList.innerHTML = '<p style="text-align:center;color:#64748b;">Aucune tâche trouvée.</p>';
    return;
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  currentPage      = Math.min(currentPage, totalPages);
  const start      = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated  = filtered.slice(start, start + ITEMS_PER_PAGE);
  const priorityLabels = { low: 'Basse', medium: 'Moyenne', high: 'Haute' };

  paginated.forEach(task => {
    const isCompleted = task.status === 'completed';
    const taskDiv     = document.createElement('div');
    taskDiv.className = 'task-item';
    const priorityClass = `priority-${task.priority}`;
    taskDiv.innerHTML = `
      <div class="task-info ${isCompleted ? 'completed' : ''}">
        <strong>${task.title}</strong>
        <span class="priority-badge ${priorityClass}">${priorityLabels[task.priority] || task.priority}</span>
        <div style="margin:5px 0;color:#94a3b8;font-size:0.9rem;">${task.description || ''}</div>
        <span class="status-badge ${isCompleted ? 'status-completed' : 'status-in-progress'}">
          ${isCompleted ? 'Terminé' : 'En cours'}
        </span>
      </div>
      <div class="actions">
        <button onclick="toggleStatus(${task.id})" style="background:${isCompleted ? '#92400e' : '#065f46'};">
          ${isCompleted ? 'Reprendre' : 'Terminer'}
        </button>
        <button onclick="editTask(${task.id})" style="background:#1e40af;">Modifier</button>
        <button onclick="deleteTask(${task.id})" style="background:#7f1d1d;">Supprimer</button>
      </div>
    `;
    taskList.appendChild(taskDiv);
  });

  if (totalPages > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className   = 'page-btn';
    prevBtn.textContent = '← Préc';
    prevBtn.disabled    = currentPage === 1;
    prevBtn.onclick     = () => { currentPage--; renderTasks(); };

    const info = document.createElement('span');
    info.className   = 'page-info';
    info.textContent = `Page ${currentPage} sur ${totalPages}`;

    const nextBtn = document.createElement('button');
    nextBtn.className   = 'page-btn';
    nextBtn.textContent = 'Suiv →';
    nextBtn.disabled    = currentPage === totalPages;
    nextBtn.onclick     = () => { currentPage++; renderTasks(); };

    paginationDiv.append(prevBtn, info, nextBtn);
  }
}

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    showMessage('Le titre est obligatoire !', 'error');
    return;
  }

  const editingId = taskIdInput.value;

  if (editingId) {
    const taskIndex = tasks.findIndex(t => t.id == editingId);
    if (taskIndex !== -1) {
      tasks[taskIndex].title       = title;
      tasks[taskIndex].description = descriptionInput.value;
      tasks[taskIndex].priority    = priorityInput.value;
      showMessage('Tâche mise à jour avec succès !', 'success');
    }
    resetFormState();
  } else {
    const newTask = {
      id:          Date.now(),
      title,
      description: descriptionInput.value,
      priority:    priorityInput.value,
      status:      'in progress'
    };
    tasks.unshift(newTask);
    showMessage('Tâche ajoutée avec succès !', 'success');
    localStorage.removeItem(draftKey);
  }

  saveData();
  taskForm.reset();
});

window.deleteTask = (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
    tasks = tasks.filter(task => task.id !== id);
    showMessage('Tâche supprimée !', 'success');
    saveData();
  }
};

window.toggleStatus = (id) => {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = task.status === 'in progress' ? 'completed' : 'in progress';
    saveData();
  }
};

window.editTask = (id) => {
  const task = tasks.find(t => t.id === id);
  if (task) {
    taskIdInput.value      = task.id;
    titleInput.value       = task.title;
    descriptionInput.value = task.description;
    priorityInput.value    = task.priority;
    formTitle.textContent   = 'Modifier la tâche';
    submitBtn.textContent   = 'Sauvegarder';
    cancelBtn.style.display = 'block';
    window.scrollTo(0, 0);
  }
};

cancelBtn.addEventListener('click', () => {
  taskForm.reset();
  resetFormState();
});

function resetFormState() {
  taskIdInput.value       = '';
  formTitle.textContent   = 'Ajouter une tâche';
  submitBtn.textContent   = 'Ajouter la tâche';
  cancelBtn.style.display = 'none';
}

function saveData() {
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
  renderTasks();
}