let subtasks = [];

/**
 * Toggles visibility of subtask buttons based on input value.
 * @param {HTMLInputElement} input - The input element inside the subtask container.
 */
function toggleSubtaskButtons(input) {
  let container = input.closest(".subtask-input-container");
  let cancelBtn = container.querySelector(".cancel-subtask-button");
  let confirmBtn = container.querySelector(".confirm-subtask-button");
  let addBtn = container.querySelector(".add-subtask-button");
  let divider = container.querySelector(".subtask-divider");

  if (input.value.trim() !== "") {
    cancelBtn.classList.remove("d-none");
    confirmBtn.classList.remove("d-none");
    divider.classList.remove("d-none");
    addBtn.classList.add("d-none");
  } else {
    cancelBtn.classList.add("d-none");
    confirmBtn.classList.add("d-none");
    divider.classList.add("d-none");
    addBtn.classList.remove("d-none");
  }
}

/**
 * Clears the input value and resets subtask buttons.
 * @param {HTMLElement} button - The button triggering the clear action.
 */
function clearSubtaskInput(button) {
  let container = button.closest(".subtask-input-container");
  let input = container.querySelector(".subtask-input");
  input.value = "";
  toggleSubtaskButtons(input);
}

/**
 * Adds a new subtask to the subtasks list and renders it in the UI.
 * Skips if the input is empty.
 */
function addSubtask() {
  let input = document.querySelector('.subtask-input');
  let title = input.value.trim();
  if (!title) return;

  let subtaskId = `sub${subtasks.length + 1}`;
  subtasks.push({ id: subtaskId, title, done: false });

  renderSubtaskList(subtaskId, title);
  input.value = "";
  input.blur();
  toggleSubtaskButtons(input);
}

/**
 * Renders a subtask entry in the DOM.
 * @param {string} id - Subtask ID.
 * @param {string} title - Subtask title.
 */
function renderSubtaskList(id, title) {
  let li = document.createElement('li');
  li.className = 'subtask-item';
  li.id = `subtask-${id}`;
  li.innerHTML = getSubtaskViewTemplate(id, title);
  document.getElementById('subtask-list').appendChild(li);
}

/**
 * Switches a subtask from view mode to edit mode.
 * @param {string} id - Subtask ID to be edited.
 */
function editSubtask(id) {
  let li = document.getElementById(`subtask-${id}`);
  let title = li.querySelector('.subtask-title').textContent;
  li.innerHTML = getSubtaskEditTemplate(id, title);
  li.querySelector('.edit-subtask-input').focus();
}

/**
 * Exits edit mode, updates the subtask title if changed, and renders it in view mode.
 * @param {string} id - Subtask ID being edited.
 */
function exitSubtaskEdit(id) {
  setTimeout(() => {
    let li = document.getElementById(`subtask-${id}`);
    if (!li) return;

    let input = li.querySelector('.edit-subtask-input');
    if (!input) return;

    let newTitle = input.value.trim();
    let sub = subtasks.find(s => s.id === id);
    let finalTitle = newTitle || (sub ? sub.title : '');

    li.innerHTML = getSubtaskViewTemplate(id, finalTitle);
  }, 100);
}

/**
 * Deletes a subtask from the DOM by its ID.
 * @param {string} id - ID of the subtask to delete.
 */
function deleteSubtask(id) {
  let li = document.getElementById(`subtask-${id}`);
  li.remove();
}

/**
 * Toggles the completion state of a subtask (done/undone).
 * @param {string} id - ID of the subtask to toggle.
 */
function toggleSubtaskDone(id) {
  let sub = subtasks.find(s => s.id === id);
  if (sub) sub.done = !sub.done;
}

/**
 * Sets up focus styling on the subtask input container when the DOM is loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  let container = document.getElementById("subtask-input-container");
  if (container) {
    container.addEventListener("focusin", () => container.classList.add("input-focus"));
    container.addEventListener("focusout", () => container.classList.remove("input-focus"));
  }
});

