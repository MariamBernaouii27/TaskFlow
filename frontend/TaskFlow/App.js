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
const searchInput       = document.getElementById('searchInput');   // Feature 6
const resultsCount      = document.getElementById('resultsCount');  // Feature 6
const paginationDiv     = document.getElementById('pagination');    // Feature 6

let tasks = JSON.parse(localStorage.getItem(tasksKey)) || [];

document.addEventListener('DOMContentLoaded', () => {
  const savedDraft = localStorage.getItem(draftKey);
  if (savedDraft) {
    const confirmRestore = confirm('We found an unsaved draft. Would you like to restore it?');
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
  if (taskIdInput.value !== '') return; // don't draft during edit

  const taskData = {
    title:       titleInput.value,
    description: descriptionInput.value,
    priority:    priorityInput.value
  };
  localStorage.setItem(draftKey, JSON.stringify(taskData));
});


searchInput.addEventListener('input', () => {
  currentSearch = searchInput.value.trim().toLowerCase();
  currentPage   = 1; // reset to first page on new search
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
  
    const statusMatch = currentStatusFilter === 'all' || task.status === currentStatusFilter;

    
    const priorityMatch = currentPriorityFilter === 'all' || task.priority === currentPriorityFilter;

    
    const keyword = currentSearch;
    const searchMatch = !keyword ||
      task.title.toLowerCase().includes(keyword) ||
      (task.description || '').toLowerCase().includes(keyword);

    return statusMatch && priorityMatch && searchMatch;
  });
}


function renderTasks() {
  taskList.innerHTML    = '';
  paginationDiv.innerHTML = '';

  const filtered = getFilteredTasks();
  const total    = filtered.length;

  
  resultsCount.textContent = total === 0
    ? 'No tasks match your filters.'
    : `Showing ${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, total)}–${Math.min(currentPage * ITEMS_PER_PAGE, total)} of ${total} task${total !== 1 ? 's' : ''}`;

  if (total === 0) {
    taskList.innerHTML = '<p style="text-align:center;color:#64748b;">No tasks found.</p>';
    return;
  }

  
  const totalPages  = Math.ceil(total / ITEMS_PER_PAGE);
  currentPage       = Math.min(currentPage, totalPages); // guard after deletion
  const start       = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated   = filtered.slice(start, start + ITEMS_PER_PAGE);

  
  paginated.forEach(task => {
    const isCompleted = task.status === 'completed';
    const taskDiv     = document.createElement('div');
    taskDiv.className = 'task-item';

    const priorityClass = `priority-${task.priority}`;

    taskDiv.innerHTML = `
      <div class="task-info ${isCompleted ? 'completed' : ''}">
        <strong>${task.title}</strong>
        <span class="priority-badge ${priorityClass}">${task.priority}</span>
        <div style="margin:5px 0;color:#94a3b8;font-size:0.9rem;">${task.description || ''}</div>
        <span class="status-badge ${isCompleted ? 'status-completed' : 'status-in-progress'}">
          ${isCompleted ? 'Completed' : 'In Progress'}
        </span>
      </div>
      <div class="actions">
        <button onclick="toggleStatus(${task.id})" style="background:${isCompleted ? '#92400e' : '#065f46'};">
          ${isCompleted ? 'Resume' : 'Complete'}
        </button>
        <button onclick="editTask(${task.id})" style="background:#1e40af;">Edit</button>
        <button onclick="deleteTask(${task.id})" style="background:#7f1d1d;">Delete</button>
      </div>
    `;
    taskList.appendChild(taskDiv);
  });

  
  if (totalPages > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className   = 'page-btn';
    prevBtn.textContent = '← Prev';
    prevBtn.disabled    = currentPage === 1;
    prevBtn.onclick     = () => { currentPage--; renderTasks(); };

    const info = document.createElement('span');
    info.className   = 'page-info';
    info.textContent = `Page ${currentPage} of ${totalPages}`;

    const nextBtn = document.createElement('button');
    nextBtn.className   = 'page-btn';
    nextBtn.textContent = 'Next →';
    nextBtn.disabled    = currentPage === totalPages;
    nextBtn.onclick     = () => { currentPage++; renderTasks(); };

    paginationDiv.append(prevBtn, info, nextBtn);
  }
}


taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    showMessage('Title is required!', 'error');
    return;
  }

  const editingId = taskIdInput.value;

  if (editingId) {
    const taskIndex = tasks.findIndex(t => t.id == editingId);
    if (taskIndex !== -1) {
      tasks[taskIndex].title       = title;
      tasks[taskIndex].description = descriptionInput.value;
      tasks[taskIndex].priority    = priorityInput.value;
      showMessage('Task updated successfully!', 'success');
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
    showMessage('Task added successfully!', 'success');
    localStorage.removeItem(draftKey); // Feature 7: clear draft on successful submit
  }

  saveData();
  taskForm.reset();
});


window.deleteTask = (id) => {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(task => task.id !== id);
    showMessage('Task deleted!', 'success');
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

    formTitle.textContent    = 'Edit Task';
    submitBtn.textContent    = 'Save Changes';
    cancelBtn.style.display  = 'block';

    window.scrollTo(0, 0);
  }
};

cancelBtn.addEventListener('click', () => {
  taskForm.reset();
  resetFormState();
});

function resetFormState() {
  taskIdInput.value       = '';
  formTitle.textContent   = 'Add a Task';
  submitBtn.textContent   = 'Add Task';
  cancelBtn.style.display = 'none';
}

function saveData() {
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
  renderTasks();
}