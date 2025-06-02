

const avatarColors = ["#FF7A00", "#FF5C01", "#FFBB2E", "#0095FF", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1", "#FF4646", "#FFC700", "#BEE800"];


/**
 * Generates a consistent avatar background color based on a user's name.
 * Hashes the name string and maps it to one of the predefined colors.
 *
 * @param {string} name - The user's full name.
 * @returns {string} A hex color code from the avatarColors array.
 */

function getColorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash % avatarColors.length)];
}


/**
 * Generates a consistent avatar Initials  based on a user's name.
 *
 * @param {string} name - The user's full name.
 */

function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  let initials = parts[0][0];
  if (parts.length > 1) initials += parts[1][0];
  return initials.toUpperCase();
}

/**
 * Returns a deterministic background color based on a given name.
 * This is used to generate visually distinct avatar colors.
 *
 * @param {string} name - The name used to generate a color hash.
 * @returns {string} A hex color code selected from a predefined palette.
 */

function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#FF7A00", "#9327FF", "#6E52FF", "#FC71FF", "#00BEE8", "#1FD7C1", "#0038FF"];
  return colors[Math.abs(hash) % colors.length];
}


/**
 * Creates an HTML string representing a task card for the Kanban board.
 * The card includes title, description, priority icon, category styling,
 * assigned users, and subtask progress. It is also draggable and clickable.
 *
 * @param {Object} task - The task object containing all relevant data.
 * @returns {string} HTML string representing the rendered task card.
 */

function createTaskCard(task) {
  const assignedHTML = renderAssignedPeople(task.assignedPeople || []);

  
  const { total, done } = calculateSubtaskProgress(task.subtasks || {});
  const priorityIcon = getPriorityIcon(task.priority);
  const typeStyle = getCategoryStyle(task.category);
  const progressPercent = (done / total) * 100;

  return `


    <div class="card" draggable="true" onclick="openOverlayFromCard('${task.id}')"
         ondragstart="startDragging(event)" id="${task.id}">
      
      <div class="card-type" style="${typeStyle}">${task.category || "Task"}</div>
      <div class="card-title">${task.title}</div>
      <div class="card-description">${task.description || ""}</div>
  

      ${total > 0 ? `
        <div class="card-footer">
          <div class="progress">
            <div class="progress-bar" style="width: ${progressPercent}%"></div>
          </div>
          <span class="subtasks">${done}/${total} Subtasks</span>
        </div>` : ""}

      <div class="card-bottom">
        <div class="avatars">${assignedHTML}</div>
        <div class="menu-icon">${priorityIcon}</div>
      </div>
    </div>
 
  `;
}


/**
 * Generates HTML for displaying avatars of assigned people.
 * Each avatar shows the initials of the person's name and a background color
 *
 * @param {Array<Object>} people - Array of person objects.
 * @returns {string} HTML string containing styled avatar elements.
 */

function renderAssignedPeople(people) {
  if (!people || people.length === 0) return "";

  let displayLimit = 3;
  let avatars = people.slice(0, displayLimit).map(person => {
    const initials = getInitials(person.name);
    const color = getColorForName(person.name);
    return `<div class="avatar" style="background-color:${color}">${initials}</div>`;
  }).join("");

  if (people.length > displayLimit) {
    const remaining = people.length - displayLimit;
    avatars += `<div class="avatar avatar-counter">+${remaining}</div>`;
  }

  return avatars;
}



/**
 * calculates the progress on subtasks 
 * 
 * 
 * @param {string} subtasks 
 * @returns total amount of subtasks and finished amount of subtasks
 */

function calculateSubtaskProgress(subtasks) {
  let total = 0, done = 0;
  for (const key in subtasks) {
    total++;
    if (subtasks[key].done) done++;
  }
  return { total, done };
}

/**
 * Returns an HTML string for the corresponding priority icon.
 * Converts the priority string to lowercase and maps it to an SVG file.
 *
 * @param {string} priority - The priority level ("Urgent", "Medium", or "Low").
 * @returns {string} An HTML <img> element as a string, or an empty string if unknown.
 */

function getPriorityIcon(priority) {
  const icons = {
    urgent: "urgent.svg",
    medium: "medium.svg",
    low: "low.svg"
  };
  const key = (priority || "").toLowerCase();
  return icons[key] ? `<img src="svg/${icons[key]}" alt="${key} icon" />` : "";
}

/**
 * checks if category is technical task if true 
 * @param {string} category 
 * @returns backround colour tourquise
 */

function getCategoryStyle(category) {
  return (category || "").toLowerCase() === "technical task"
    ? "background-color: turquoise;"
    : "";
}


  /**
 * Loads all tasks and people data from the backend and renders the tasks onto the board.
 * Each task is enriched with assigned people data before being inserted into its column.
 *
 * Fetches:
 * - Task data from the "Tasks" endpoint
 * - Person data from the "person" endpoint
 *
 * Calls `insertTaskIntoColumn` for each task with resolved person assignments.
 *
 * @function loadBoardTasks
 * @returns 
 */

  async function loadBoardTasks() {
    const [tasksRes, peopleRes] = await Promise.all([
      fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json"),
      fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json")
    ]);
    const tasksData = await tasksRes.json();
    const peopleData = await peopleRes.json();
  
    for (const [id, task] of Object.entries(tasksData)) {
      const personIds = Object.values(task.assignedTo || {});
      const currentUser = getCurrentUser();
      const assignedPeople = personIds.map(pid => peopleData[pid] || (currentUser && pid === currentUser.id ? currentUser : null)).filter(Boolean);
      const fullTask = { id, ...task, assignedPeople };
      insertTaskIntoColumn(fullTask);
    }
  }
  
/**
 * Inserts a task card into the appropriate board column based on its status.
 * If the column doesn't exist or the status is unknown, the function exits early.
 * Hides the "no tasks" placeholder and appends the task card to a bucket container.
 *
 * @param {Object} task - The task object to insert.
 */
  function insertTaskIntoColumn(task) {
    const columnSelector = getColumnSelector(task);
    if (!columnSelector) return;
  
    hideNoTasksMessage(columnSelector);
    insertTaskCard(columnSelector, task);
  }
  

  /**
 * Returns the CSS selector string for the board column corresponding to the task's status.
 * Normalizes the status to lowercase and maps it to a column index using a predefined map.
 * If the status is unknown, logs a warning and returns null.
 *
 * @param {Object} task - The task object containing status information.
 */
  function getColumnSelector(task) {
    const status = (task.Status || task.status || "").toLowerCase();
    const map = {
      "to-do": 1,
      "in progress": 2,
      "await feedback": 3,
      "done": 4
    };
  
    const index = map[status];
    if (!index) {
      console.warn("Unbekannter Status:", status);
      return null;
    } 
    return `.board-cards .progress-section:nth-child(${index})`;
  }
  
/**
 * if there is a task in the sector the NoTask Message dissapears 
 * @param {string} selector 
 */

  function hideNoTasksMessage(selector) {
    const container = document.querySelector(`${selector} .no-tasks`);
    if (container) container.classList.add("d-none");
  }
  
/**
 * Inserts a task card into the specified board column.
 * Ensures that a container with class `.card-bucket` exists within the column.
 * If the bucket is missing, it creates and appends it before adding the task card.
 *
 * @param {string} selector - CSS selector for the target column (e.g., ".board-cards .progress-section:nth-child(1)").
 * @param {Object} task - Task object used to render the task card.
 */

  function insertTaskCard(selector, task) {
    const column = document.querySelector(selector);
    let bucket = column.querySelector('.card-bucket');
  
    if (!bucket) {
      bucket = document.createElement('div');
      bucket.classList.add('card-bucket');
      column.appendChild(bucket);
    }
  
    bucket.insertAdjacentHTML("beforeend", createTaskCard(task));
  }
  
  
  /**
 * Initializes the board by loading tasks once the DOM is fully loaded.
 * Ensures that tasks are fetched and rendered into the correct board columns.
 *
 * @event DOMContentLoaded
 */

  document.addEventListener("DOMContentLoaded", () => {
    loadBoardTasks();
  });


/**
 * Opens the task detail overlay for the given task ID.
 * Searches for the task in the globally stored task list and renders the overlay.
 * Logs a warning if the task cannot be found.
 *
 * @param {string} taskId - The unique ID of the task to display in the overlay.
 */

  window.openOverlayFromCard = function(taskId) {
    const task = window.allTasks.find(t => t.id === taskId);
  
    if (!task) {
      console.warn(" Task nicht gefunden!");
      return;
    }
    showTaskOverlay(task);
  };
  
  
  /**
 * Displays the task detail overlay for the provided task.
 * Injects the HTML markup into the overlay container and applies an animation class.
 *
 * @param {Object} task - The task object to display in the overlay.
 */
  function showTaskOverlay(task) {
    const overlayContainer = document.getElementById("overlay-container");
    overlayContainer.innerHTML = buildOverlayHTML(task);
    overlayContainer.style.display = "flex";
  
    const overlay = overlayContainer.querySelector('.task-card-overlay');
    if (overlay) {
      overlay.classList.add('animate-in');
    }
  }
  
  /**
   * close the Overlay
   */
  function closeOverlay() {
    const overlay = document.getElementById("overlay-container");
    overlay.innerHTML = "";
    overlay.style.display = "none";
  }
  

/**
 * Builds and returns the HTML markup for the task overlay.
 * Includes task details such as title, description, due date, priority icon, assigned people, and subtasks.
 *
 * @param {Object} task - The task object containing all necessary task data.
 * @returns {string} - HTML string representing the full overlay view.
 */

  function buildOverlayHTML(task) {
    const priorityIcon = (() => {
      switch ((task.priority || "").toLowerCase()) {
        case "urgent":
          return `<img src="svg/urgent.svg" alt="Urgent Icon" style="height: 16px; vertical-align: middle; margin-left: 6px;">`;
        case "medium":
          return `<img src="svg/medium.svg" alt="Medium Icon" style="height: 16px; vertical-align: middle; margin-left: 6px;">`;
        case "low":
          return `<img src="svg/low.svg" alt="Low Icon" style="height: 16px; vertical-align: middle; margin-left: 6px;">`;
        default:
          return "";
      }
    })();
    let categoryLabelStyle = "";

if ((task.category || "").toLowerCase() === "technical task") {
  categoryLabelStyle = "background-color: turquoise;";
}

    const subtasksHtml = buildSubtasks(task.subtasks, task.id);
    const peopleHtml = task.assignedPeople.map(person => {
      const initials = getInitials(person.name);
      const bg = getColorForName(person.name);


      return `
        <div class="task-card-person">
          <div class="task-card-avatar" style="background-color:${bg};">${initials}</div>
          <span class="task-card-name">${person.name}</span>
        </div>`;
    }).join("");
  
    return `
      <div class="task-card-overlay">
      <div class="task-card-label" style="${categoryLabelStyle}">${task.category || "Kategorie"}</div>
        <div class="task-card-close-btn" onclick="closeOverlay()">&times;</div>
  
        <div class="task-card-title">${task.title || "Kein Titel"}</div>
        <div class="task-card-description">${task.description || ""}</div>
  
        <div class="task-card-info"><strong>Due date:</strong> ${task.dueDate || "-"}</div>
        <div class="task-card-info ">
          <strong>Priority:</strong>   <span>
          ${task.priority || "-"}
          ${priorityIcon}
        </span>
        </div>
  
        <div class="task-card-info"><strong>Assigned To:</strong></div>
        <div class="task-card-assigned">${peopleHtml}</div>
  
        <div class="task-card-subtasks">
          <strong>Subtasks</strong>
          ${subtasksHtml}
        </div>
  
        <div class="task-card-actions">
          <button class="task-card-delete-btn hover-blue" onclick="deleteTask('${task.id}')"><img src="svg/delete.svg" alt="" style="margin-right: 8px; position: relative; top: -1px;">Delete</button>
          <button class="task-card-edit-btn hover-blue" onclick="switchToEditMode('${task.id}')"><img src="svg/edit-black.svg" style="margin-right: 8px; position: relative; top: -1px;" alt="" srcset="">Edit</button>
        </div>
      </div>`;
  }
  



  document.addEventListener("click", function (event) {
    const overlay = document.getElementById("overlay-container");
    const card = document.querySelector(".task-card-overlay");
  
    if (
      overlay.style.display === "flex" &&
      overlay.contains(event.target) &&
      card &&
      !card.contains(event.target)
    ) {
      closeOverlay();
    }
  });
  


  
/**
 * Switches the task overlay to edit mode for the given task ID.
 * Renders the edit form, shows the overlay, and initializes interactive elements such as priority buttons and assigned contacts.
 *
 * @async
 * @param {string} taskId - The ID of the task to be edited.
 */

  async function switchToEditMode(taskId) {
    const task = window.allTasks.find(t => t.id === taskId);
    if (!task) return;
    const overlay = document.getElementById("overlay-container");
    overlay.innerHTML = buildEditTaskForm(task);
    overlay.style.display = "flex";
  
    setTimeout(async () => {
      setupPriorityButtons();                    // Priority Buttons aktivieren
      await assignedToInput();                   // Kontakte laden
      preselectAssignedUsers(task.assignedTo);   // Haken setzen
      highlightPriorityButton(task.priority);    // Priority selektieren
    }, 0);
  }
  
  /**
 * Initializes click event listeners on priority buttons.
 * Ensures only one priority (urgent, medium, or low) is active at a time
 * by applying the appropriate CSS class to the selected button.
 */
  function setupPriorityButtons() {
    const buttons = document.querySelectorAll(".priority-btn");
  
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active-urgent", "active-medium", "active-low"));
  
        if (button.classList.contains("urgent")) button.classList.add("active-urgent");
        if (button.classList.contains("medium")) button.classList.add("active-medium");
        if (button.classList.contains("low")) button.classList.add("active-low");
      });
    });
  }
  

  /**
 * Builds and returns the HTML markup for the edit task form overlay.
 * 
 * @param {Object} task - The task object containing data to populate the form.
 * 
 * @returns {string} HTML string representing the complete editable task form.
 */
  
  function buildEditTaskForm(task) {
    return `
      <div class="task-card-overlay" style="max-height: 70vh; overflow-y: auto; gap:4px">
        <div class="task-card-close-btn" onclick="closeOverlay()">&times;</div>
  
        <label style="margin-bottom: 0;">Title</label>
        <input type="text" id="edit-title" value="${task.title}" />
  
        <label style="margin-bottom: 0; margin-top: 8px;">Description</label>
        <textarea id="edit-desc" style="min-height: 70px;">${task.description}</textarea>
  
        <label style="margin-bottom: 0; margin-top: 8px;">Due Date</label>
        <input type="date" id="edit-due-date" value="${task.dueDate}" />
  
        <label style="margin-bottom: 0; margin-top: 8px;">Priority</label>
        <div class="priority-buttons">
          <button type="button" class="priority-btn urgent">Urgent <img src="svg/urgent.svg"></button>
          <button type="button" class="priority-btn medium">Medium <img src="svg/medium.svg"></button>
          <button type="button" class="priority-btn low">Low <img src="svg/low.svg"></button>
        </div>
  
        <label for="assigned" style="margin-bottom: 0; margin-top: 8px;">Assigned to</label>
        <div class="assigned-dropdown" style="margin-bottom: 15px;">
          <div class="assigned-select" onclick="toggleAssignedDropdown(event)">
            <input
              type="text"
              id="assigned-search"
              class="assigned-search-input"
              placeholder="Select contacts to assign"
              oninput="filterAssignedList()"
            />
            <span class="dropdown-arrow">▼</span>
          </div>
          <div class="assigned-options d-none" id="assigned-list"></div>
        </div>
        <div id="selected-avatars" style="margin-bottom: 15px; margin-top: 0px;" class="selected-avatars"></div>
  
        <label style="margin-bottom: 0; margin-top: 8px;">Category</label>
        <select id="edit-category"  style="height: 50px;" >
          <option value="Technical Task" ${task.category === "Technical Task" ? "selected" : ""}>Technical Task</option>
          <option value="User Story" ${task.category === "User Story" ? "selected" : ""}>User Story</option>
        </select>
  
        <label style="margin-bottom: 0; margin-top: 8px;">Subtasks</label>
        <div class="subtasks-section">
        <div class="subtask-input-wrapper">
        <input type="text" id="edit-subtask-input" class="subtask-input" placeholder="Add new subtask" />
        <button type="button" class="subtask-add-btn" onclick="addSubtaskInEditForm()">+</button>
      </div>
      
          <ul id="subtask-list">
            ${Object.entries(task.subtasks || {}).map(([id, sub]) => `
              <li class="subtask-item" id="subtask-${id}" ondblclick="editSubtask('${id}')">
                <span class="subtask-title">${sub.title}</span>
                <div class="subtask-actions">
                  <img src="svg/edit-black.svg" class="subtask-icon" onclick="editSubtask('${id}')">
                  <span class="divider"></span>
                  <img src="svg/delete.svg" class="subtask-icon" onclick="deleteSubtask('${id}')">
                </div>
              </li>
            `).join("")}
          </ul>
        </div>
  
        <div class="task-card-actions">
          <button class="task-card-edit-save-btn" onclick="saveTaskChanges('${task.id}')">Save <img src="svg/check.svg" alt="" srcset=""></button>
        </div>
      </div>
    `;
  }
  

  /**
 * Adds a new subtask entry to the subtask list in the edit task form.
 * 
 * - Reads the input field for a new subtask title.
 * - If valid, generates a unique ID using the current timestamp.
 * - Creates a new list item with appropriate HTML structure.
 * - Appends it to the subtask list in the DOM.
 * - Clears the input field afterward.
 * 
 * Does nothing if the input field is empty.
 */
  function addSubtaskInEditForm() {
    const input = document.getElementById('edit-subtask-input');
    const title = input.value.trim();
    if (!title) return;
    const id = `sub${Date.now()}`; 
    const ul = document.getElementById('subtask-list');
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
    ul.appendChild(li);
    input.value = '';
  }
  


  /**
 * Switches a subtask list item into edit mode.
 * 
 * - Replaces the static subtask title with an input field.
 * - Provides action icons for saving or deleting the subtask.
 * 
 * @param {string} id - The unique identifier of the subtask to be edited.
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
 * Saves the edited subtask title and exits edit mode.
 * 
 * - Retrieves the new title from the input field.
 * - Replaces the input with the updated static subtask title.
 * - Restores edit and delete icons.
 * 
 * @param {string} id - The unique identifier of the subtask being saved.
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
   * 
   * This function deletes the Subtask in our databank
   * 
   * @param {string} id 
   */
  
  function deleteSubtask(id) {
    const li = document.getElementById(`subtask-${id}`);
    if (li) li.remove();
  }
  

  /**
 * Highlights the priority button that matches the given priority.
 *
 * - Clears existing active priority classes.
 * - Applies the corresponding active class based on the priority string.
 *
 * @param {string} priority - The priority level to highlight ("Urgent", "Medium", or "Low").
 */
  function highlightPriorityButton(priority) {
    const buttons = document.querySelectorAll(".priority-btn");
    buttons.forEach(btn => btn.classList.remove("active-urgent", "active-medium", "active-low"));
    const match = {
      "urgent": "active-urgent",
      "medium": "active-medium",
      "low": "active-low"
    }[(priority || "").toLowerCase()];
  
    if (match) {
      const button = [...buttons].find(b => b.classList.contains(match.replace("active-", "")));
      if (button) button.classList.add(match);
    }
  }


/**
 * Preselects users in the edit form based on their IDs.
 *
 * - Checks checkboxes of users whose IDs exist in the given assignedTo object.
 * - Visually highlights the selected rows.
 * - Updates the selected avatars display.
 *
 * @param {Object} assignedToObj - An object mapping keys to user IDs (e.g., { person1: "-xyz", person2: "-abc" }).
 */

  function preselectAssignedUsers(assignedToObj) {
    if (!assignedToObj) return;
    const ids = Object.values(assignedToObj); 
    document.querySelectorAll(".assigned-checkbox").forEach(checkbox => {
      if (ids.includes(checkbox.dataset.id)) {
        checkbox.checked = true;
        checkbox.closest(".assigned-row").classList.add("active");
      }
    });
  
    updateSelectedAvatars();
  }
  

  /**
 * Updates the avatar display for all currently selected (checked) assigned users.
 *
 * - Clears the existing avatars.
 * - For each checked checkbox, extracts the user’s name, generates initials and background color.
 * - Inserts a new avatar element into the container.
 */
  function updateSelectedAvatars() {
    const container = document.getElementById("selected-avatars");
    container.innerHTML = "";
  
    document.querySelectorAll(".assigned-checkbox:checked").forEach(box => {
      const name = box.dataset.name;
      const initials = getInitials(name);
      const bg = getColorFromName(name);
      container.innerHTML += `
        <div class="selected-avatar" style="background-color: ${bg}">${initials}</div>`;
    });
  }
  

  /**
 * Returns the inline CSS style string for the task category label.
 *
 * @param {string} category - The category name of the task.
 * @returns {string} A style string to apply background color if category is "technical task", otherwise an empty string.
 */
  function getCategoryLabelStyle(category) {
    return (category || '').toLowerCase() === 'technical task' ? 'background-color: turquoise;' : '';
  }
  
/**
 * Saves the updated changes of a task to the database.
 *
 * @param {string} taskId - The ID of the task to be updated.
 */
  async function saveTaskChanges(taskId) {
    const originalTask = findOriginalTask(taskId);
    if (!originalTask) return;
  
    const updatedTask = buildUpdatedTask(originalTask);
  
    try {
      await saveTaskToDatabase(taskId, updatedTask);
      handleSuccessfulSave();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  }
  
/**
 * Retrieves the original task object from the global task list using the task ID.
 *
 * @param {string} taskId - The ID of the task to find.
 */

  function findOriginalTask(taskId) {
    const task = window.allTasks.find(t => t.id === taskId);
    if (!task) {
      console.warn("Task nicht gefunden:", taskId);
    }
    return task;
  }
  
/**
 * Constructs an updated task object based on the form input values and the original task's status.
 *
 * @param {Object} originalTask - The original task object containing at least the Status property.
 */

  function buildUpdatedTask(originalTask) {
    return {
      title: getInputValue("edit-title"),
      description: getInputValue("edit-desc"),
      dueDate: getInputValue("edit-due-date"),
      priority: getSelectedPriorityFromEditForm(),
      category: getInputValue("edit-category"),
      assignedTo: collectAssignedUserIds(),
      subtasks: collectEditedSubtasks(),
      Status: originalTask.Status
    };
  }
  
  function getInputValue(id) {
    return document.getElementById(id)?.value.trim();
  }
  

  /**
 * Sends an updated task object to the Firebase database using a PATCH request.
 *
 * @param {string} taskId - The ID of the task to be updated.
 * @param {Object} data - The task data to be saved.
 */

  async function saveTaskToDatabase(taskId, data) {
    const url = `https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }
  
/**
 * if the task is succesfully saved the overlay closes and the site reloads
 */

  function handleSuccessfulSave() {
    closeOverlay();
    location.reload();
  }
  
/**
 * Retrieves the selected priority from the edit form based on which priority button is active.
 *
 * @returns {string} The selected priority: "Urgent", "Medium", "Low", or an empty string if none are selected.
 */

  function getSelectedPriorityFromEditForm() {
    const buttons = document.querySelectorAll(".priority-btn");
    if (buttons[0].classList.contains("active-urgent")) return "Urgent";
    if (buttons[1].classList.contains("active-medium")) return "Medium";
    if (buttons[2].classList.contains("active-low")) return "Low";
    return "";
  }
  
/**
 * Collects the IDs of all checked assigned users from the form and maps them to person keys.
 *
 */

  function collectAssignedUserIds() {
    const assignedTo = {};
    const checkboxes = document.querySelectorAll(".assigned-checkbox:checked");
    checkboxes.forEach((box, i) => {
      const id = box.dataset.id;
      if (id) assignedTo[`person${i + 1}`] = id;
    });
    return assignedTo;
  }

  /**
 * Collects all edited subtasks from the DOM and constructs a subtasks object.
 * It extracts either the edited input value or the displayed title from each subtask item.
 *
 * @returns {Object} An object containing subtask entries keyed by their ID,
 *                   each with a `title` and a default `done: false` status.
 */
  
  function collectEditedSubtasks() {
    const items = document.querySelectorAll("#subtask-list .subtask-item");
    const subtasks = {};
    items.forEach(el => {
      const id = el.id.replace("subtask-", ""); 
      const input = el.querySelector(".edit-subtask-input");
      const title = input
        ? input.value.trim()
        : el.querySelector(".subtask-title")?.textContent.trim(); 
      if (title) {
        subtasks[id] = { title, done: false };
      }
    });
    return subtasks;
  }
  
  
/**
 * Builds the HTML markup for displaying subtasks with checkboxes.
 * Falls back to a placeholder if no subtasks exist.
 *
 * @param {Object} subtasks - An object where each key maps to a subtask with a `title` and `done` boolean.
 * @param {string} taskId - The ID of the task the subtasks belong to.
 * @returns {string} HTML string representing the subtasks list.
 */
  function buildSubtasks(subtasks, taskId) {
    if (!subtasks || typeof subtasks !== "object") {
      return `<p style="font-style: italic; color: gray;">Keine Subtasks vorhanden</p>`;
    }
  
    if (subtasks.title) {
      return `<label>
        <input style="height: 14px;" type="checkbox" onchange="toggleSubtask('${taskId}', 'sub1', this.checked)">
        ${subtasks.title}
      </label>`;
    }
  
    return Object.entries(subtasks).map(([key, sub]) => {
      return `<label class="subtask-label">
        <input type="checkbox" onchange="toggleSubtask('${taskId}', '${key}', this.checked)" ${sub.done ? "checked" : ""}>
        ${sub.title}
      </label>`;
    }) .join("");
  }
  
/**
 * Toggles the completion status of a subtask both in the database and locally,
 * then updates the DOM to reflect the changes.
 *
 * @param {string} taskId - The ID of the task containing the subtask.
 * @param {string} subtaskKey - The key identifying the subtask.
 * @param {boolean} isChecked - The new completion status of the subtask.
 */
  async function toggleSubtask(taskId, subtaskKey, isChecked) {
    try {
      await updateSubtaskStatusInDB(taskId, subtaskKey, isChecked);
  
      const task = findTask(taskId);
      if (!task) return;
  
      if (!validateSubtaskExists(task, subtaskKey)) return;
  
      updateLocalSubtaskStatus(task, subtaskKey, isChecked);
      updateTaskCardDOM(taskId, task);
  
    } catch (error) {
      console.error(" Fehler beim Subtask-Update:", error);
    }
  }
  /**
 * Updates the completion status of a specific subtask in the Firebase database.
 *
 * @param {string} taskId - The ID of the task that contains the subtask.
 * @param {string} subtaskKey - The key of the subtask to update.
 * @param {boolean} isChecked - The new completion status (true or false).
 */

  async function updateSubtaskStatusInDB(taskId, subtaskKey, isChecked) {
    const url = `https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}/subtasks/${subtaskKey}/done.json`;
  
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isChecked)
    });
  
    return await response.json();
  }
  

/**
 * Finds a task in the global window.allTasks array by its ID.
 *
 * @param {string} taskId - The ID of the task to find.
 */

  function findTask(taskId) {
    const task = window.allTasks.find(t => t.id === taskId);
    if (!task) {
      console.warn(" Task nicht in window.allTasks gefunden:", taskId);
    }
    return task;
  }
  
/**
 * Checks whether a specific subtask exists within a task object.
 *
 * @param {object} task - The task object containing subtasks.
 * @param {string} subtaskKey - The key of the subtask to validate.
 * @returns {boolean} True if the subtask exists, false otherwise.
 */

  function validateSubtaskExists(task, subtaskKey) {
    const exists = task.subtasks && task.subtasks[subtaskKey];
    if (!exists) {
      console.warn(" Subtask nicht gefunden im Task-Objekt:", subtaskKey);
    }
    return exists;
  }
  

  /**
 * Updates the local status of a subtask (done/undone) within a given task object.
 *
 * @param {object} task - The task object containing subtasks.
 * @param {string} subtaskKey - The key of the subtask to update.
 * @param {boolean} isChecked - The new completion status of the subtask.
 */
  function updateLocalSubtaskStatus(task, subtaskKey, isChecked) {
    task.subtasks[subtaskKey].done = isChecked;
  }
  
/**
 * Replaces the existing task card in the DOM with an updated version based on the provided task data.
 *
 * @param {string} taskId - The ID of the task whose card should be updated.
 * @param {object} task - The updated task object used to regenerate the card's HTML.
 */

  function updateTaskCardDOM(taskId, task) {
    const card = document.getElementById(`${taskId}`);
    if (!card) {
      console.warn(" Card-Element im DOM nicht gefunden:", taskId);
      return;
    }
  
    const newCardHTML = createTaskCard(task);
    card.outerHTML = newCardHTML;
  }
  
  
  
/**
 * Initializes the application once the DOM is fully loaded.
 * Loads all tasks with their assigned people and stores them globally.
 */

  document.addEventListener("DOMContentLoaded", async () => {
    await getAllTasksWithPeople();     

  });

/**
 * Deletes a task from the Firebase database and updates the UI accordingly.
 *
 * @param {string} taskId - The ID of the task to delete.
 *
 */
  async function deleteTask(taskId) {
    const url = `https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`;
    try {
      const response = await fetch(url, {
        method: "DELETE"
      });
      if (response.ok) {
        window.allTasks = window.allTasks.filter(task => task.id !== taskId);
        const card = document.getElementById(taskId);
        if (card) {
          card.remove();
        }
        closeOverlay();
      } else {
        console.error("Fehler beim Löschen:", response.statusText);
      }
    } catch (error) {
      console.error("Fehler beim Löschen des Tasks:", error);
    }
    checkEmptySections()
  }
  

  /**
 * Checks all progress sections on the board and toggles the visibility
 * of the "no tasks" message depending on whether any task cards are present.
 */
  function checkEmptySections() {
    document.querySelectorAll('.progress-section').forEach(section => {
      const cards = Array.from(section.querySelectorAll('.card'));
      const visibleCards = cards.filter(card => card.style.display !== "none");
      const noTasks = section.querySelector('.no-tasks');
      
      if (visibleCards.length === 0 && noTasks) {
        noTasks.classList.remove('d-none');
      } else if (visibleCards.length > 0 && noTasks) {
        noTasks.classList.add('d-none');
      }
    });
  }
  
/**
 * Filters visible task cards on the board based on the search input.
 * If the input length is less than 3 characters, all cards are shown.
 * Otherwise, only cards with titles matching the search term are displayed.
 * 
 * Also triggers a check to update the "no tasks" message per section.
 */

function handleTaskSearch() {
  const searchInput = document.getElementById('taskSearchInput').value.trim().toLowerCase();
  const allCards = document.querySelectorAll('.card'); 

  if (searchInput.length < 2) {
    allCards.forEach(card => {
      card.style.display = "block";
    });
    checkEmptySections();
    return;
    
  }

/**
 * Filters task cards based on the user's search input.
 * 
 * - If the input has fewer than 3 characters, all task cards are shown.
 * - If the input is 3 or more characters long, only task cards whose title
 *   includes the search term (case-insensitive) will be displayed.
 * 
 * After filtering, it triggers a check to show or hide "no tasks" messages
 * in each board column, depending on whether cards remain visible.
 */
allCards.forEach(card => {
  const titleElement = card.querySelector('.card-title');
  const descElement = card.querySelector('.card-description');

  const title = titleElement ? titleElement.textContent.toLowerCase() : "";
  const description = descElement ? descElement.textContent.toLowerCase() : "";

  if (title.includes(searchInput) || description.includes(searchInput)) {
    card.style.display = "block"; 
  } else {
    card.style.display = "none"; 
  }
});

  checkEmptySections();

}