// =================== Priority Button Handling ===================
const priorityButtons = document.querySelectorAll('.priority-btn');

priorityButtons.forEach(button => {
  button.addEventListener('click', () => {
    const isActive = button.classList.contains('active-urgent') ||
                     button.classList.contains('active-medium') ||
                     button.classList.contains('active-low');

    priorityButtons.forEach(btn => {
      btn.classList.remove('active-urgent', 'active-medium', 'active-low');
    });

    if (!isActive) {
      if (button.classList.contains('urgent')) {
        button.classList.add('active-urgent');
      } else if (button.classList.contains('medium')) {
        button.classList.add('active-medium');
      } else if (button.classList.contains('low')) {
        button.classList.add('active-low');
      }
    }
  });
});

// =================== Clear Button Handling ===================
function clearForm() {
  document.getElementById('title').value = '';
  document.getElementById('desc').value = '';
  document.getElementById('due-date').value = '';
  document.getElementById('assigned').selectedIndex = 0;
  document.getElementById('category').selectedIndex = 0;

  const subtaskInput = document.querySelector('.subtask-input');
  if (subtaskInput) subtaskInput.value = '';

  const titleError = document.getElementById('title-error');
  if (titleError) titleError.classList.add('d-none');

  const categoryError = document.getElementById('category-error');
  if (categoryError) categoryError.classList.add('d-none');

  priorityButtons.forEach(btn => {
    btn.classList.remove('active-urgent', 'active-medium', 'active-low');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const clearButton = document.querySelector('.clear-btn');
  if (clearButton) {
    clearButton.addEventListener('click', (e) => {
      e.preventDefault();
      clearForm();
    });
  }
});

// =================== Load Contacts into Assigned Select ===================
const url = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json";

async function assignedToInput() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    const assigned = document.getElementById("assigned");
    assigned.innerHTML = '<option disabled selected hidden>Select contacts to assign</option>'; // Reset options

    const keys = Object.keys(data);
    for (let key of keys) {
      const person = data[key];
      const option = document.createElement("option");
      option.value = person.name;
      option.textContent = person.name;
      assigned.appendChild(option);
    }
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}

window.assignedToInput = assignedToInput;
