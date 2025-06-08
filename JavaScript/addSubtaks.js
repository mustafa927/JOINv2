let subtasks = [];
  
function toggleSubtaskButtons(input) {
  const container = input.closest(".subtask-input-container");
  const cancelBtn = container.querySelector(".cancel-subtask-button");
  const confirmBtn = container.querySelector(".confirm-subtask-button");
  const addBtn = container.querySelector(".add-subtask-button");
  const divider = container.querySelector(".subtask-divider"); // <== Hinzugefügt

  if (input.value.trim() !== "") {
    cancelBtn.classList.remove("d-none");
    confirmBtn.classList.remove("d-none");
    divider.classList.remove("d-none"); // <== Sichtbar machen
    addBtn.classList.add("d-none");
  } else {
    cancelBtn.classList.add("d-none");
    confirmBtn.classList.add("d-none");
    divider.classList.add("d-none"); // <== Verstecken
    addBtn.classList.remove("d-none");
  }
}


function clearSubtaskInput(button) {
  const container = button.closest(".subtask-input-container");
  const input = container.querySelector(".subtask-input");
  input.value = "";
  toggleSubtaskButtons(input);
}


/** 
 * adds subtask via subtask-input value to Subtasklist
 * @returns 
 */

function addSubtask() {
  const input = document.querySelector('.subtask-input');
  const title = input.value.trim();
  if (!title) return;

  const subtaskId = `sub${subtasks.length + 1}`;
  subtasks.push({ id: subtaskId, title, done: false });

  renderSubtaskList(subtaskId, title);
  input.value = ""; // 🧼 Feld leeren
  input.blur();
  toggleSubtaskButtons(input);
}


/**
 * Renders a subtask item in the list based on given ID and title.
 * 
 * @param {string} id - The unique ID for the subtask.
 * @param {string} title - The title of the subtask.
 */
function renderSubtaskList(id, title) {
  const li = document.createElement('li');
  li.className = 'subtask-item';
  li.id = `subtask-${id}`;
  li.innerHTML = `&bull;&nbsp;
    <span class="subtask-title" onclick="editSubtask('${id}')">${title}</span>
    <div class="subtask-actions">
     <img src="svg/edit-black.svg" class="subtask-icon" onclick="editSubtask('${id}')" >
      <span class="divider"></span>
      <img src="svg/delete.svg" class="subtask-icon" onclick="deleteSubtask('${id}')">
    </div>
  `;
  document.getElementById('subtask-list').appendChild(li);
}


/**
 * Enables inline editing for a specific subtask by ID.
 * 
 * @param {string} id - The ID of the subtask to edit.
 */
function editSubtask(id) {
  const li = document.getElementById(`subtask-${id}`);
  const title = li.querySelector('.subtask-title').textContent;

  li.innerHTML = `
    <div class="edit-subtask-container">
      <input 
        type="text" 
        class="edit-subtask-input" 
        value="${title}" 
         onblur="exitSubtaskEdit('${id}')" 
       
      />
      <div class="edit-subtask-icons">
        <img 
          src="svg/delete.svg" 
          alt="Delete" 
          class="edit-subtask-icon" 
          onclick="deleteSubtask('${id}')" 
        />
        <img 
          src="svg/checkButton.svg" 
          alt="Save" 
          class="edit-subtask-icon" 
          onclick="exitSubtaskEdit('${id}')" 

        />
      </div>
    </div>
  `;

  li.querySelector('.edit-subtask-input').focus();
}


function exitSubtaskEdit(id) {
  setTimeout(() => {
    const li = document.getElementById(`subtask-${id}`);
    if (!li) return;

    const input = li.querySelector('.edit-subtask-input');
    if (!input) return;

    const newTitle = input.value.trim();
    const sub = subtasks.find(s => s.id === id);
    const finalTitle = newTitle || (sub ? sub.title : '');

    li.innerHTML = `
      <span class="bullet">&bull;&nbsp;</span>
      <span class="subtask-title" onclick="editSubtask('${id}')">${finalTitle}</span>
      <div class="subtask-actions">
        <img 
          src="svg/edit-black.svg" 
          class="subtask-icon" 
          tabindex="0"
          onclick="editSubtask('${id}')" 
          onfocus="editSubtask('${id}')" 
          alt="Edit Subtask"
        >
        <span class="divider"></span>
        <img 
          src="svg/delete.svg" 
          class="subtask-icon" 
          onclick="deleteSubtask('${id}')" 
          alt="Delete Subtask"
        >
      </div>
    `;
  }, 100); // Verzögere das Entfernen, damit Clicks erfasst werden
}



/**
 * Removes a subtask from the DOM by ID.
 * 
 * @param {string} id - The ID of the subtask to delete.
 */
function deleteSubtask(id) {
  const li = document.getElementById(`subtask-${id}`);
  li.remove();
}

/**
 * Toggles the completion state of a subtask.
 * 
 * @param {string} id - The ID of the subtask to toggle.
 */
function toggleSubtaskDone(id) {
  const sub = subtasks.find(s => s.id === id);
  if (sub) sub.done = !sub.done;
}


document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("subtask-input-container");

  if (container) {
    container.addEventListener("focusin", () => {
      container.classList.add("input-focus");
    });

    container.addEventListener("focusout", () => {
      container.classList.remove("input-focus");
    });
  }
});
