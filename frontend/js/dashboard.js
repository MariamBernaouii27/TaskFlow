const API_URL = 'http://localhost:3000';

async function loadDashboard() {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.get(`${API_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { metrics, activeTasks } = response.data;

    // Afficher les métriques
    document.getElementById('activeProjects').textContent = metrics.activeProjects;
    document.getElementById('assigned').textContent = metrics.assigned;
    document.getElementById('completed').textContent = metrics.completed;
    document.getElementById('overdue').textContent = metrics.overdue;

    // Afficher les tâches
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (activeTasks.length === 0) {
      taskList.innerHTML = `
        <tr>
          <td colspan="3" class="text-center py-4" style="color:#8892a4;">
            <i class="fa-solid fa-inbox me-2"></i>Aucune tâche active.
          </td>
        </tr>
      `;
      return;
    }

    activeTasks.forEach(task => {
      const deadline = task.deadline
        ? new Date(task.deadline).toLocaleDateString('fr-FR')
        : '—';

      const badges = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
      const icons  = { high: 'fa-fire', medium: 'fa-minus', low: 'fa-feather' };

      taskList.innerHTML += `
        <tr>
          <td>
            <i class="fa-solid fa-circle-dot me-2" style="color:#667eea; font-size:0.6rem;"></i>
            ${task.title}
          </td>
          <td>
            <span class="badge-priority ${badges[task.priority]}">
              <i class="fa-solid ${icons[task.priority]} me-1"></i>${task.priority}
            </span>
          </td>
          <td>
            <span class="deadline-chip">
              <i class="fa-regular fa-calendar"></i>${deadline}
            </span>
          </td>
        </tr>
      `;
    });

  } catch (error) {
    console.error('Erreur chargement dashboard:', error);
    document.getElementById('error').textContent = 'Erreur de chargement.';
    document.getElementById('error').classList.remove('d-none');
  }
}

loadDashboard();