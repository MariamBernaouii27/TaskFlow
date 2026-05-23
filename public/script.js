document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const addBtn = document.getElementById('addBtn');
    const taskTitle = document.getElementById('taskTitle');
    const taskDesc = document.getElementById('taskDesc');

    async function fetchTasks() {
        try {
            const res = await fetch('/taches');
            const tasks = await res.json();
            
            taskList.innerHTML = '';
            
            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';
                taskItem.innerHTML = `
                    <h3>${task.titre || 'Sans titre'}</h3>
                    <p>${task.description || 'Pas de description'}</p>
                `;
                taskList.appendChild(taskItem);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des tâches:', error);
        }
    }
    addBtn.addEventListener('click', async () => {
        const titre = taskTitle.value.trim();
        const description = taskDesc.value.trim();

        if (!titre) {
            alert('Veuillez entrer un titre !');
            return;
        }

        try {
            const response = await fetch('/taches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ titre, description })
            });

            if (response.ok) {
                taskTitle.value = '';
                taskDesc.value = '';
                fetchTasks();
            } else {
                alert('Erreur lors de l\'ajout de la tâche');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    });
    fetchTasks();
});