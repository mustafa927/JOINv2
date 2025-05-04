

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





function createTaskCard(task) {
    const assignedHTML = (task.assignedPeople || []).map(person => {
      const initials = getInitials(person.name);
      const color = getColorForName(person.name);
      return `<div class="avatar" style="background-color:${color}">${initials}</div>`;
    }).join("");
  
    const subtasks = task.subtasks || {};
    let total = 0, done = 0;
    for (const key in subtasks) {
      total++;
      if (subtasks[key].done) done++;
    }
  
    let priorityIcon = "";
    switch ((task.priority || "").toLowerCase()) {
      case "urgent":
        priorityIcon = `<img src="svg/urgent.svg" alt="Urgent Icon" />`;
        break;
      case "medium":
        priorityIcon = `<img src="svg/medium.svg" alt="Medium Icon" />`;
        break;
      case "low":
        priorityIcon = `<img src="svg/low.svg" alt="Low Icon" />`;
        break;
      default:
        priorityIcon = "";
    }

    let typeStyle = "";

if ((task.category || "").toLowerCase() === "technical task") {
  typeStyle = "background-color: turquoise;";
}


    return `
      <div class="card" draggable="true" onclick="openOverlayFromCard('${task.id}')"
      ondragstart="startDragging(event)" id="${task.id}">
      <div class="card-type" style="${typeStyle}">${task.category || "Task"}</div>
        <div class="card-title">${task.title}</div>
        <div class="card-description">${task.description || ""}</div>
        
        <div class="card-footer">
          <div class="progress">
            <div class="progress-bar" style="width: ${(done / total) * 100 || 0}%"></div>
          </div>
          <span class="subtasks">${done}/${total} Subtasks</span>
        </div>
  
        <div class="card-bottom">
          <div class="avatars">${assignedHTML}</div>
          <div class="menu-icon">${priorityIcon}</div></div>
        </div>
      </div>
    `;
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
  
    const container = document.querySelector(`${columnSelector} .no-tasks`);
    if (container) container.classList.add("d-none");
  
    const column = document.querySelector(columnSelector);
    column.insertAdjacentHTML("beforeend", createTaskCard(task));
  }
  

  document.addEventListener("DOMContentLoaded", () => {
    loadBoardTasks();
  });

  window.openOverlayFromCard = function(taskId) {
    console.log("🟡 Suche nach Task mit ID:", taskId);
    console.log("📦 Alle Tasks:", window.allTasks);
  
    const task = window.allTasks.find(t => t.id === taskId);
  
    if (!task) {
      console.warn("❌ Task nicht gefunden!");
      return;
    }
  
    console.log("✅ Task gefunden:", task);
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
          <button class="task-card-edit-btn">Edit</button>
        </div>
      </div>`;
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