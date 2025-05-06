const priorityButtons = document.querySelectorAll('.priority-btn');


function setupPriorityButtons() {
  priorityButtons.forEach(button => {
    button.addEventListener('click', () => handlePriorityClick(button));
  });
}


function handlePriorityClick(button) {
  const isActive = button.classList.contains('active-urgent') ||
                   button.classList.contains('active-medium') ||
                   button.classList.contains('active-low');

  removePriorityClasses();

  if (!isActive) {
    addPriorityClass(button);
  }
}


function removePriorityClasses() {
  priorityButtons.forEach(btn => {
    btn.classList.remove('active-urgent', 'active-medium', 'active-low');
  });
}


function addPriorityClass(button) {
  if (button.classList.contains('urgent')) button.classList.add('active-urgent');
  if (button.classList.contains('medium')) button.classList.add('active-medium');
  if (button.classList.contains('low')) button.classList.add('active-low');
}


function clearForm() {
  resetInputs();
  hideErrors();
  removePriorityClasses();
}


function resetInputs() {
  document.getElementById('title').value = '';
  document.getElementById('desc').value = '';
  document.getElementById('due-date').value = '';
  document.getElementById('assigned').selectedIndex = 0;
  document.getElementById('category').selectedIndex = 0;

  const subtask = document.querySelector('.subtask-input');
  if (subtask) subtask.value = '';
}


function hideErrors() {
  ['title-error', 'category-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('d-none');
  });
}


async function assignedToInput() {
  try {
    const response = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
    const data = await response.json();
    fillAssignedSelect(data);
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}


function fillAssignedSelect(data) {
  const assigned = document.getElementById("assigned");
  assigned.innerHTML = '<option disabled selected hidden>Select contacts to assign</option>';

  Object.values(data).forEach(person => {
    const option = document.createElement("option");
    option.value = person.name;
    option.textContent = person.name;
    assigned.appendChild(option);
  });
}


document.addEventListener('DOMContentLoaded', () => {
  setupPriorityButtons();

  const clearBtn = document.querySelector('.clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', e => {
      e.preventDefault();
      clearForm();
    });
  }
});


window.assignedToInput = assignedToInput;
