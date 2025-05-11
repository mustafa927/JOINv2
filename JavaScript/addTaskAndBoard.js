const TASKS_URL = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json";

async function handleCreateTask() {
  if (!validateForm()) return;
  let task = collectFormData();
  await saveTaskToFirebase(task);
  clearForm();
  showSuccessMessage();
  setTimeout(() => {
    window.location.href = 'boardsection.html';
  }, 1500);
}

function validateForm() {
  let valid = true;
  let title = document.getElementById('title').value.trim();
  let category = document.getElementById('category').value;
  if (!title) {
    showError('title-error');
    valid = false;
  } else hideError('title-error');
  if (!category) {
    showError('category-error');
    valid = false;
  } else hideError('category-error');
  return valid;
}

function showError(id) {
  let el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

function hideError(id) {
  let el = document.getElementById(id);
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
    let response = await fetch(TASKS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    let result = await response.json();
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
  let input = document.querySelector('.subtask-input');
  if (input) input.value = '';
}

function showSuccessMessage() {
  let message = document.getElementById('task-success-message');
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
  } catch (error) {
    console.error('Fehler beim Status-Update:', error);
  }
}
