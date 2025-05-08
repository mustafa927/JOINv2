

const avatarColors = ["#FF7A00", "#FF5C01", "#FFBB2E", "#0095FF", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1", "#FF4646", "#FFC700", "#BEE800"];


function getColorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash % avatarColors.length)];
}

function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  let initials = parts[0][0];
  if (parts.length > 1) initials += parts[1][0];
  return initials.toUpperCase();
}

function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#FF7A00", "#9327FF", "#6E52FF", "#FC71FF", "#00BEE8", "#1FD7C1", "#0038FF"];
  return colors[Math.abs(hash) % colors.length];
}


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


function renderAssignedPeople(people) {
  return people.map(person => {
    const initials = getInitials(person.name);
    const color = getColorForName(person.name);
    return `<div class="avatar" style="background-color:${color}">${initials}</div>`;
  }).join("");
}

function calculateSubtaskProgress(subtasks) {
  let total = 0, done = 0;
  for (const key in subtasks) {
    total++;
    if (subtasks[key].done) done++;
  }
  return { total, done };
}

function getPriorityIcon(priority) {
  const icons = {
    urgent: "urgent.svg",
    medium: "medium.svg",
    low: "low.svg"
  };
  const key = (priority || "").toLowerCase();
  return icons[key] ? `<img src="svg/${icons[key]}" alt="${key} icon" />` : "";
}

function getCategoryStyle(category) {
  return (category || "").toLowerCase() === "technical task"
    ? "background-color: turquoise;"
    : "";
}


  

  async function loadBoardTasks() {
    const [tasksRes, peopleRes] = await Promise.all([
      fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json"),
      fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json")
    ]);
  
    const tasksData = await tasksRes.json();
    const peopleData = await peopleRes.json();
  
    for (const [id, task] of Object.entries(tasksData)) {
      const personIds = Object.values(task.assignedTo || {});
      const assignedPeople = personIds.map(pid => peopleData[pid]).filter(Boolean);
      const fullTask = { id, ...task, assignedPeople };
  
      insertTaskIntoColumn(fullTask);
    }
  }
  

  function insertTaskIntoColumn(task) {
    const status = (task.Status || task.status || "").toLowerCase();
    let columnSelector;
  
    switch (status) {
      case "to-do":
        columnSelector = ".board-cards .progress-section:nth-child(1)";
        break;
      case "in progress":
        columnSelector = ".board-cards .progress-section:nth-child(2)";
        break;
      case "await feedback":
        columnSelector = ".board-cards .progress-section:nth-child(3)";
        break;
      case "done":
        columnSelector = ".board-cards .progress-section:nth-child(4)";
        break;
      default:
        console.warn("Unbekannter Status:", status);
        return;
    }
  
    // ✅ no-tasks verstecken, wenn vorhanden
    const container = document.querySelector(`${columnSelector} .no-tasks`);
    if (container) container.classList.add("d-none");
  
    // ✅ Card-Bucket prüfen oder erstellen
    const column = document.querySelector(columnSelector);
    let bucket = column.querySelector('.card-bucket');
    if (!bucket) {
      bucket = document.createElement('div');
      bucket.classList.add('card-bucket');
      column.appendChild(bucket);
    }
  
    // ✅ Card in den Bucket einfügen
    bucket.insertAdjacentHTML("beforeend", createTaskCard(task));
  }
  
  

  document.addEventListener("DOMContentLoaded", () => {
    loadBoardTasks();
  });

  window.openOverlayFromCard = function(taskId) {
  
    const task = window.allTasks.find(t => t.id === taskId);
  
    if (!task) {
      console.warn("❌ Task nicht gefunden!");
      return;
    }

    showTaskOverlay(task);
  };
  
  
  
  function showTaskOverlay(task) {
    const overlayContainer = document.getElementById("overlay-container");
    overlayContainer.innerHTML = buildOverlayHTML(task);
    overlayContainer.style.display = "flex";
  }
  
  function closeOverlay() {
    const overlay = document.getElementById("overlay-container");
    overlay.innerHTML = "";
    overlay.style.display = "none";
  }
  
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
          <button class="task-card-delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
          <button class="task-card-edit-btn" onclick="switchToEditMode('${task.id}')">Edit</button>
        </div>
      </div>`;
  }
  




  


  async function switchToEditMode(taskId) {
    const task = window.allTasks.find(t => t.id === taskId);
    if (!task) return;
    const overlay = document.getElementById("overlay-container");
    overlay.innerHTML = buildEditTaskForm(task);
    overlay.style.display = "flex";
  
    // Warten auf DOM, dann Setup
    setTimeout(async () => {
      setupPriorityButtons();                    // Priority Buttons aktivieren
      await assignedToInput();                   // Kontakte laden
      preselectAssignedUsers(task.assignedTo);   // Haken setzen
      highlightPriorityButton(task.priority);    // Priority selektieren
    }, 0);
  }
  
  
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
  
  
  function buildEditTaskForm(task) {
    return `
      <div class="task-card-overlay" style="max-height: 60vh; overflow-y: auto;">
        <div class="task-card-close-btn" onclick="closeOverlay()">&times;</div>
  
        <label>Title</label>
        <input type="text" id="edit-title" value="${task.title}" />
  
        <label>Description</label>
        <textarea id="edit-desc">${task.description}</textarea>
  
        <label>Due Date</label>
        <input type="date" id="edit-due-date" value="${task.dueDate}" />
  
        <label>Priority</label>
        <div class="priority-buttons">
          <button type="button" class="priority-btn urgent">Urgent <img src="svg/urgent.svg"></button>
          <button type="button" class="priority-btn medium">Medium <img src="svg/medium.svg"></button>
          <button type="button" class="priority-btn low">Low <img src="svg/low.svg"></button>
        </div>
  
        <label for="assigned">Assigned to</label>
        <div class="assigned-dropdown">
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
        <div id="selected-avatars" class="selected-avatars"></div>
  
        <label>Category</label>
        <select id="edit-category">
          <option value="Technical Task" ${task.category === "Technical Task" ? "selected" : ""}>Technical Task</option>
          <option value="User Story" ${task.category === "User Story" ? "selected" : ""}>User Story</option>
        </select>
  
        <label>Subtasks</label>
        <div class="subtasks-section">
        <div class="subtask-input-wrapper">
        <input type="text" id="edit-subtask-input" class="subtask-input" placeholder="Add new subtask" />
        <button type="button" class="subtask-add-btn" onclick="addSubtaskInEditForm()">+</button>
      </div>
      
          <ul id="subtask-list">
            ${Object.entries(task.subtasks || {}).map(([id, sub]) => `
              <li class="subtask-item" id="subtask-${id}">
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
          <button class="task-card-edit-btn" onclick="saveTaskChanges('${task.id}')">Save</button>
        </div>
      </div>
    `;
  }
  
  function addSubtaskInEditForm() {
    const input = document.getElementById('edit-subtask-input');
    const title = input.value.trim();
    if (!title) return;
  
    const id = `sub${Date.now()}`; // sicheres, eindeutiges ID
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
  
  function deleteSubtask(id) {
    const li = document.getElementById(`subtask-${id}`);
    if (li) li.remove();
  }
  
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

  function preselectAssignedUsers(assignedToObj) {
    if (!assignedToObj) return;
  
    const ids = Object.values(assignedToObj); // ["-xyz", "-abc"]
    document.querySelectorAll(".assigned-checkbox").forEach(checkbox => {
      if (ids.includes(checkbox.dataset.id)) {
        checkbox.checked = true;
        checkbox.closest(".assigned-row").classList.add("active");
      }
    });
  
    updateSelectedAvatars();
  }
  
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
  

  
  function getCategoryLabelStyle(category) {
    return (category || '').toLowerCase() === 'technical task' ? 'background-color: turquoise;' : '';
  }
  
  async function saveTaskChanges(taskId) {
    const originalTask = window.allTasks.find(t => t.id === taskId);
    if (!originalTask) {
      console.warn("❌ Task nicht gefunden!");
      return;
    }
  
    const updatedTask = {
      title: document.getElementById("edit-title").value.trim(),
      description: document.getElementById("edit-desc").value.trim(),
      dueDate: document.getElementById("edit-due-date").value,
      priority: getSelectedPriorityFromEditForm(),
      category: document.getElementById("edit-category").value,
      assignedTo: collectAssignedUserIds(),
      subtasks: collectEditedSubtasks(),
      Status: originalTask.Status // ✅ Bestehenden Status übernehmen (Großschreibung beachten!)
    };
  
    try {
      await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask)
      });
  
      console.log("✅ Task gespeichert:", updatedTask);
      closeOverlay();
      location.reload(); // 🔄 Seite neu laden, um Änderungen zu sehen
    } catch (error) {
      console.error("❌ Fehler beim Speichern:", error);
    }
  }
  


  function getSelectedPriorityFromEditForm() {
    const buttons = document.querySelectorAll(".priority-btn");
    if (buttons[0].classList.contains("active-urgent")) return "Urgent";
    if (buttons[1].classList.contains("active-medium")) return "Medium";
    if (buttons[2].classList.contains("active-low")) return "Low";
    return "";
  }
  
  function collectAssignedUserIds() {
    const assignedTo = {};
    const checkboxes = document.querySelectorAll(".assigned-checkbox:checked");
    checkboxes.forEach((box, i) => {
      const id = box.dataset.id;
      if (id) assignedTo[`person${i + 1}`] = id;
    });
    return assignedTo;
  }
  
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
  
  


  // Baut Subtasks-HTML
  function buildSubtasks(subtasks, taskId) {
    if (!subtasks || typeof subtasks !== "object") {
      return `<p style="font-style: italic; color: gray;">Keine Subtasks vorhanden</p>`;
    }
  
    if (subtasks.title) {
      return `<label>
        <input type="checkbox" onchange="toggleSubtask('${taskId}', 'sub1', this.checked)">
        ${subtasks.title}
      </label>`;
    }
  
    return Object.entries(subtasks).map(([key, sub]) => {
      return `<label>
        <input type="checkbox" onchange="toggleSubtask('${taskId}', '${key}', this.checked)" ${sub.done ? "checked" : ""}>
        ${sub.title}
      </label>`;
    }).join("");
  }
  

  async function toggleSubtask(taskId, subtaskKey, isChecked) {
    const url = `https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}/subtasks/${subtaskKey}/done.json`;
  
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isChecked)
      });
  
      const result = await response.json();
  
      // Lokalen Task finden
      const task = window.allTasks.find(t => t.id === taskId);
      if (!task) {
        console.warn("Task nicht in window.allTasks gefunden:", taskId);
        return;
      }
  
      if (!task.subtasks || !task.subtasks[subtaskKey]) {
        console.warn("Subtask nicht gefunden im Task-Objekt:", subtaskKey);
        return;
      }
  
      // Subtask lokal aktualisieren
      task.subtasks[subtaskKey].done = isChecked;
  
      // Card ersetzen
      const card = document.getElementById(`${taskId}`);
      if (!card) {
        console.warn("⚠️ Card-Element im DOM nicht gefunden:", `${taskId}`);
        return;
      }
  
      const newCardHTML = createTaskCard(task);
      card.outerHTML = newCardHTML;
  
    } catch (error) {
      console.error("❌ Fehler beim Subtask-Update:", error);
    }
  }
  
  
  


  document.addEventListener("DOMContentLoaded", async () => {
    await getAllTasksWithPeople();     // 🔥 holt alle Tasks mit Personen

  });


  async function deleteTask(taskId) {
    const url = `https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`;
  
    try {
      const response = await fetch(url, {
        method: "DELETE"
      });
  
      if (response.ok) {
        console.log(`✅ Task ${taskId} wurde erfolgreich gelöscht.`);
  
        // 🧹 Jetzt auch aus window.allTasks entfernen
        window.allTasks = window.allTasks.filter(task => task.id !== taskId);
  
        // 🧼 Und die Card im Board entfernen
        const card = document.getElementById(taskId);
        if (card) {
          card.remove();
        }
  
        // 🧼 Optional: Overlay schließen, wenn es offen war
        closeOverlay();
  
      } else {
        console.error("❌ Fehler beim Löschen:", response.statusText);
      }
  
    } catch (error) {
      console.error("❌ Fehler beim Löschen des Tasks:", error);
    }
    checkEmptySections()

  }
  
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
  
function handleTaskSearch() {
  const searchInput = document.getElementById('taskSearchInput').value.trim().toLowerCase();
  const allCards = document.querySelectorAll('.card'); // holt alle Task-Cards

  if (searchInput.length < 3) {
    // Wenn weniger als 3 Buchstaben → alle zeigen
    allCards.forEach(card => {
      card.style.display = "block";
    });
    checkEmptySections();
    return;
    
  }


  allCards.forEach(card => {
    const titleElement = card.querySelector('.card-title');
    const title = titleElement ? titleElement.textContent.toLowerCase() : "";

    if (title.includes(searchInput)) {
      card.style.display = "block"; // Übereinstimmung → zeigen
    } else {
      card.style.display = "none";  // Keine Übereinstimmung → verstecken
    }
  });

  checkEmptySections();

}