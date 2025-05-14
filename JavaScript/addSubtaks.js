let subtasks = [];
  
function addSubtask() {
  const input = document.querySelector('.subtask-input');
  const title = input.value.trim();
  if (!title) return;

  const subtaskId = `sub${subtasks.length + 1}`;
  subtasks.push({ id: subtaskId, title, done: false });

  renderSubtaskList(subtaskId, title);
  input.value = ""; // 🧼 Feld leeren
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
  li.innerHTML = `
    <span class="subtask-title">${title}</span>
    <div class="subtask-actions">
      <img src="svg/edit-black.svg" class="subtask-icon" onclick="editSubtask('${id}')">
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
  <input type="text" class="edit-subtask-input" value="${title}" />
<div class="subtask-actions">
  <img src="svg/delete.svg" class="subtask-icon" onclick="deleteSubtask('${id}')">
  <span class="divider"></span>
  <span class="subtask-icon" onclick="saveSubtask('${id}')">✔</span>
</div>

  `;
}



/**
 * Saves changes made to a subtask after editing.
 * 
 * @param {string} id - The ID of the subtask to save.
 */
function saveSubtask(id) {
  const li = document.getElementById(`subtask-${id}`);
  const newTitle = li.querySelector('.edit-subtask-input').value.trim();
  if (!newTitle) return;

  li.innerHTML = `
    <span class="subtask-title">${newTitle}</span>
    <div class="subtask-actions">
      <img src="svg/edit-black.svg" class="subtask-icon" onclick="editSubtask('${id}')">
      <span class="divider"></span>
      <img src="svg/delete.svg" class="subtask-icon" onclick="deleteSubtask('${id}')">
    </div>
  `;
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
