// --- Firebase URL
const TASKS_URL = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json";

// --- DOMContentLoaded: Warten bis Seite geladen ist
document.addEventListener('DOMContentLoaded', () => {
  const createBtn = document.querySelector('.create-btn');
  const clearBtn = document.querySelector('.clear-btn');

  if (createBtn) {
    createBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await handleCreateTask();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearForm();
    });
  }

  if (window.location.pathname.includes('boardsection.html')) {
    loadTasks();
  }
});

// --- Task anlegen
async function handleCreateTask() {
  const titleInput = document.getElementById('title');
  const categoryInput = document.getElementById('category');

  // Pflichtfelder prüfen
  if (titleInput.value.trim() === "") {
    document.getElementById('title-error').style.display = 'block';
    return;
  } else {
    document.getElementById('title-error').style.display = 'none';
  }

  if (!categoryInput.value) {
    document.getElementById('category-error').style.display = 'block';
    return;
  } else {
    document.getElementById('category-error').style.display = 'none';
  }

  // Task-Daten sammeln
  const taskData = {
    title: titleInput.value,
    description: document.getElementById('desc').value,
    dueDate: document.getElementById('due-date').value,
    category: categoryInput.value,
    status: 'To-Do'
  };

  // Speichern in Firebase
  await saveTaskToFirebase(taskData);

  // Formular leeren
  clearForm();

  // Erfolgsmeldung anzeigen
  showSuccessMessage();

  // Nach kurzer Zeit weiterleiten aufs Board
  setTimeout(() => {
    window.location.href = 'boardsection.html';
  }, 1500);
}

// --- Task speichern in Firebase
async function saveTaskToFirebase(task) {
  try {
    const response = await fetch(TASKS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    const result = await response.json();
    console.log('Task gespeichert mit ID:', result.name);
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
  }
}

// --- Formular zurücksetzen
function clearForm() {
  document.getElementById('title').value = '';
  document.getElementById('desc').value = '';
  document.getElementById('due-date').value = '';
  document.getElementById('category').selectedIndex = 0;

  const priorityButtons = document.querySelectorAll('.priority-btn');
  priorityButtons.forEach(btn => {
    btn.classList.remove('active-urgent', 'active-medium', 'active-low');
  });

  const subtaskInput = document.querySelector('.subtask-input');
  if (subtaskInput) subtaskInput.value = '';
}

// --- Erfolgsmeldung anzeigen
function showSuccessMessage() {
  const message = document.getElementById('task-success-message');
  if (message) {
    message.classList.remove('d-none');
    message.classList.add('show');

    setTimeout(() => {
      message.classList.remove('show');
      message.classList.add('d-none');
    }, 1200);
  }
}

// --- Tasks laden aufs Board
async function loadTasks() {
  try {
    const response = await fetch(TASKS_URL);
    const data = await response.json();
    const tasks = Object.entries(data || {});

    tasks.forEach(([id, task]) => {
      if (task.status === 'To-Do') {
        addTaskToBoard(task.title, task.description, id);
      }
    });

  } catch (error) {
    console.error('Fehler beim Laden der Tasks:', error);
  }
}

// --- Task als Card ins Board setzen
function addTaskToBoard(title, description, id) {
  const toDoSection = document.querySelector('.board-cards .progress-section:first-child');

  const card = document.createElement('div');
  card.className = 'card';
  card.id = `task-${id}`;
  card.draggable = true;
  card.ondragstart = (e) => startDragging(e);

  card.innerHTML = `
    <h4>${title}</h4>
    <p>${description || ''}</p>
  `;

  const noTasksMessage = toDoSection.querySelector('.no-tasks');
  if (noTasksMessage) noTasksMessage.classList.add('d-none');

  toDoSection.appendChild(card);
}

// --- Dragging Funktionalität
let draggedElement = null;

function startDragging(event) {
  draggedElement = event.target;
}

// --- Drop erlauben
window.allowDrop = function(event) {
  event.preventDefault();
};

// --- Task auf Dropzone ablegen
window.drop = async function(event) {
  event.preventDefault();
  const dropzone = event.currentTarget;

  if (!draggedElement || !dropzone.classList.contains('dropzone')) return;

  dropzone.appendChild(draggedElement);

  const taskId = draggedElement.id.replace('task-', '');
  const newStatus = getStatusFromDropzone(dropzone);

  if (taskId && newStatus) {
    await updateTaskStatus(taskId, newStatus);
  }
};

// --- Status erkennen anhand der Dropzone
function getStatusFromDropzone(dropzone) {
  const title = dropzone.querySelector(".to-do-header p")?.innerText.toLowerCase();

  if (title.includes("to do")) return "To-Do";
  if (title.includes("in progress")) return "In Progress";
  if (title.includes("await feedback")) return "Await Feedback";
  if (title.includes("done")) return "Done";

  return null;
}

// --- Status in Firebase aktualisieren
async function updateTaskStatus(taskId, newStatus) {
  try {
    await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: newStatus })
    });

    console.log(`Task ${taskId} Status geändert zu: ${newStatus}`);
  } catch (error) {
    console.error('Fehler beim Status-Update:', error);
  }
}
