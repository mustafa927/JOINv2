

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
  
    return `
      <div class="card" draggable="true" ondragstart="startDragging(event)" id="task-${task.id}">
        <div class="card-type">${task.category || "Task"}</div>
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
          <div class="menu-icon">≡</div>
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
  