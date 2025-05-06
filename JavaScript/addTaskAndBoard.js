const TASKS_URL = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json";


// document.addEventListener('DOMContentLoaded', () => {
//   initTaskFormButtons();
// });


// function initTaskFormButtons() {
//   const createBtn = document.querySelector('.create-btn');
//   const clearBtn = document.querySelector('.clear-btn');

//   if (createBtn) {
//     createBtn.addEventListener('click', async (e) => {
//       e.preventDefault();
//       await handleCreateTask();
//     });
//   }

//   if (clearBtn) {
//     clearBtn.addEventListener('click', (e) => {
//       e.preventDefault();
//       clearForm();
//     });
//   }
// }


async function handleCreateTask() {
  if (!validateForm()) return;

  const task = collectFormData();
  await saveTaskToFirebase(task);

  clearForm();
  showSuccessMessage();

  setTimeout(() => {
    window.location.href = 'boardsection.html';
  }, 1500);
}


function validateForm() {
  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value;

  let valid = true;

  if (!title) {
    showError('title-error');
    valid = false;
  } else {
    hideError('title-error');
  }

  if (!category) {
    showError('category-error');
    valid = false;
  } else {
    hideError('category-error');
  }

  return valid;
}


function showError(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}


function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}


function collectFormData() {
  return {
    title: document.getElementById('title').value,
    description: document.getElementById('desc').value,
    dueDate: document.getElementById('due-date').value,
    category: document.getElementById('category').value,
    status: 'To-Do'
  };
}


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


function clearForm() {
  resetFieldValues();
  resetPriorityButtons();
  clearSubtaskInput();
}


function resetFieldValues() {
  document.getElementById('title').value = '';
  document.getElementById('desc').value = '';
  document.getElementById('due-date').value = '';
  document.getElementById('category').selectedIndex = 0;
}


function resetPriorityButtons() {
  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.classList.remove('active-urgent', 'active-medium', 'active-low');
  });
}


function clearSubtaskInput() {
  const input = document.querySelector('.subtask-input');
  if (input) input.value = '';
}


function showSuccessMessage() {
  const message = document.getElementById('task-success-message');
  if (!message) return;

  message.classList.remove('d-none');
  message.classList.add('show');

  setTimeout(() => {
    message.classList.remove('show');
    message.classList.add('d-none');
  }, 1200);
}


async function updateTaskStatus(taskId, newStatus) {
  try {
    await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    console.log(`Task ${taskId} Status geändert zu: ${newStatus}`);
  } catch (error) {
    console.error('Fehler beim Status-Update:', error);
  }
}
