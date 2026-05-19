const draftKey = 'taskflow_draft';
const tasksKey = 'taskflow_tasks';

const taskForm = document.getElementById('taskForm');
const taskIdInput = document.getElementById('taskId');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const priorityInput = document.getElementById('priority');
const validationMessage = document.getElementById('validationMessage');
const taskList = document.getElementById('taskList');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');

let tasks = JSON.parse(localStorage.getItem(tasksKey)) || [];

document.addEventListener('DOMContentLoaded', () => {
  const savedDraft = localStorage.getItem(draftKey);
  if (savedDraft) {
    const confirmRestore = confirm('We found an unsaved draft. Would you like to restore it?');
    if (confirmRestore) {
      const draftData = JSON.parse(savedDraft);
      titleInput.value = draftData.title || '';
      descriptionInput.value = draftData.description || '';
      priorityInput.value = draftData.priority || 'medium';
    } else {
      localStorage.removeItem(draftKey);
    }
  }
  renderTasks();
});

taskForm.addEventListener('input', () => {
  if (taskIdInput.value !== '') return;
  
  const taskData = {
    title: titleInput.value,
    description: descriptionInput.value,
    priority: priorityInput.value
  };
  localStorage.setItem(draftKey, JSON.stringify(taskData));
});

function showMessage(text, type) {
  validationMessage.textContent = text;
  validationMessage.className = `message ${type}`;
  validationMessage.style.display = 'block';
  setTimeout(() => { validationMessage.style.display = 'none'; }, 3000);
}

function renderTasks() {
  taskList.innerHTML = '';
  
  if (tasks.length === 0) {
    taskList.innerHTML = '<p style="text-align: center; color: #777;">No tasks found. Add one!</p>';
    return;
  }

  tasks.forEach(task => {
    const isCompleted = task.status === 'completed';
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    
    taskDiv.innerHTML = `
      <div class="task-info ${isCompleted ? 'completed' : ''}">
        <strong>${task.title}</strong> - <small style="color: #666;">Priority: ${task.priority}</small> <br>
        <div style="margin: 5px 0;">${task.description}</div>
        <span class="status-badge ${isCompleted ? 'status-completed' : 'status-in-progress'}">
          ${isCompleted ? 'Completed' : 'In Progress'}
        </span>
      </div>
      <div class="actions">
        <button onclick="toggleStatus(${task.id})" style="background: ${isCompleted ? '#ffc107' : '#28a745'}; color: white; border: none; border-radius: 3px;">
          ${isCompleted ? 'Resume' : 'Complete'}
        </button>
        <button onclick="editTask(${task.id})" style="background: #17a2b8; color: white; border: none; border-radius: 3px;">Edit</button>
        <button onclick="deleteTask(${task.id})" style="background: #dc3545; color: white; border: none; border-radius: 3px;">Delete</button>
      </div>
    `;
    taskList.appendChild(taskDiv);
  });
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
      tasks[taskIndex].title = title;
      tasks[taskIndex].description = descriptionInput.value;
      tasks[taskIndex].priority = priorityInput.value;
      showMessage('Task updated successfully!', 'success');
    }
    resetFormState();
  } else {
    const newTask = {
      id: Date.now(),
      title: title,
      description: descriptionInput.value,
      priority: priorityInput.value,
      status: 'in progress'
    };
    tasks.unshift(newTask);
    showMessage('Task added successfully!', 'success');
    localStorage.removeItem(draftKey);
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
    taskIdInput.value = task.id;
    titleInput.value = task.title;
    descriptionInput.value = task.description;
    priorityInput.value = task.priority;
    
    formTitle.textContent = 'Edit Task';
    submitBtn.textContent = 'Save Changes';
    cancelBtn.style.display = 'inline-block';
    
    window.scrollTo(0, 0);
  }
};

cancelBtn.addEventListener('click', () => {
  taskForm.reset();
  resetFormState();
});

function resetFormState() {
  taskIdInput.value = '';
  formTitle.textContent = 'Add a Task';
  submitBtn.textContent = 'Add Task';
  cancelBtn.style.display = 'none';
}

function saveData() {
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
  renderTasks();
}