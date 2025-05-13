

window.allTasks = []; 

function getTaskStatus() {
  const fromURL = new URLSearchParams(window.location.search).get("status");
  return fromURL || window.parent?.currentTaskStatus || "To-Do";
}



// let newTask = {
//   title: "Kanban UI bauen",
//   description: "UI für Task-Overlay erstellen",
//   dueDate: "2025-06-10",
//   priority: "High",
//   category: "Design",
//   Status: "To-Do",
//   assignedTo: {
//     person1: "-OO2cpzcQaVpB2cvHgCp",
//     person2: "-OONRhAG3up-91-RGtpa"
//   },
//   subtasks: {
//     sub1: {
//       title: "HTML/CSS Grundstruktur",
//       done: false
//     },
//     sub2: {
//       title: "JS Integration",
//       done: true
//     }
//   }
// };

let newTask = {
  title: "",
  description: "",
  dueDate: "",
  priority: "",
  category: "",
  Status: "To-Do",
  assignedTo: {},
  subtasks: {}
};



async function fetchDataTasks() {
  console.log("fetchData gestartet");
  let response = await fetch(
    "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json"
  );
  if (!response.ok) {
    console.error("Fehler beim Abrufen der Daten");
    return;
  }
  let data = await response.json(); 
  if (data) {
    let tasks = Object.values(data); 
    allTasks = tasks;
  } else {
    console.log("Keine Aufgaben gefunden.");
  }
}

async function getAllTasksWithPeople() {
  try {
    const tasksData = await fetchTasks();
    const peopleData = await fetchPeople();
    if (!tasksData) {
      console.log("📭 Keine Tasks gefunden.");
      return [];
    }
    const tasksArray = enrichTasksWithPeople(tasksData, peopleData);
    window.allTasks = tasksArray;
    return tasksArray;
  } catch (error) {
    console.error(" Fehler beim Abrufen der Tasks mit Personen:", error);
    return [];
  }
}

async function fetchTasks() {
  const response = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json");
  return await response.json();
}

async function fetchPeople() {
  const response = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  return await response.json();
}

function enrichTasksWithPeople(tasksData, peopleData) {
  return Object.entries(tasksData).map(([id, task]) => {
    const assignedTo = task.assignedTo || {};

    const assignedPeople = Object.values(assignedTo).map(personId => {
      const person = peopleData?.[personId];
      return person ? { id: personId, ...person } : { id: personId, name: "Unbekannt" };
    });

    return { id, ...task, assignedPeople };
  });
}



function createTaskFromForm() {
  if (!validateRequiredFields()) return;

  const newTask = buildNewTask();

  addNewTask(newTask);
  showSuccessMessage();
  redirectToBoard();
}

function validateRequiredFields() {
  const titleValid = validateField("title", "title-error");
  const dateValid = validateField("due-date", "date-error");
  const categoryValid = validateField("category", "category-error");
  return titleValid && dateValid && categoryValid;
}

function validateField(inputId, errorId) {
  const value = document.getElementById(inputId).value.trim();
  const error = document.getElementById(errorId);

  if (!value) {
    showTemporaryError(error);
    return false;
  }
  return true;
}

function showTemporaryError(errorElement) {
  errorElement.classList.remove("d-none");
  setTimeout(() => errorElement.classList.add("d-none"), 3000);
}


async function createTaskFromFormOverlay() {
  if (!validateTitle() || !validateCategory()) return;
  const newTask = buildNewTask();

  try {
    await addNewTask(newTask); 
    window.parent.handleTaskCreated();
  } catch (error) {
    console.error(" Fehler beim Speichern des Tasks:", error);
    alert("Task konnte nicht gespeichert werden.");
  }
}


function closeAddTaskModal() {
  document.getElementById("addTaskModal").classList.add("d-none");
  document.getElementById("addTaskIframe").src = "about:blank";
}

function handleTaskCreated() {
  closeAddTaskModal();
  location.reload(); 
}

function validateTitle() {
  const title = document.getElementById("title").value.trim();
  const error = document.getElementById("title-error");
  const isValid = !!title;
  error.classList.toggle(isValid);
  return isValid;
}

function validateCategory() {
  const category = document.getElementById("category").value;
  const error = document.getElementById("category-error");
  const isValid = !!category;
  error.classList.toggle(isValid);
  return isValid;
}

function buildNewTask() {
  return {
    title: getValue("title"),
    description: getValue("desc"),
    dueDate: getValue("due-date"),
    priority: getSelectedPriority(),
    category: document.getElementById("category").value,
    Status: getTaskStatus(), 
    assignedTo: collectAssignedUserIds(),
    subtasks: collectSubtasks()
  };
}


function getValue(id) {
  return document.getElementById(id).value.trim();
}

function getSelectedPriority() {
  const buttons = document.querySelectorAll(".priority-btn");
  for (let btn of buttons) {
    if (btn.classList.contains("active-urgent")) return "Urgent";
    if (btn.classList.contains("active-medium")) return "Medium";
    if (btn.classList.contains("active-low")) return "Low";
  }
  return "";
}

function collectSubtasks() {
  const elements = document.querySelectorAll("#subtask-list .subtask-item");
  const subtasks = {};
  elements.forEach(el => {
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

function collectAssignedUserIds() {
  const boxes = document.querySelectorAll(".assigned-checkbox:checked");
  const assigned = {};
  boxes.forEach((box, i) => {
    const id = box.dataset.id;
    if (id) assigned[`person${i + 1}`] = id;
  });
  return assigned;
}

function redirectToBoard() {
  setTimeout(() => {
    window.location.href = "boardsection.html";
  }, 1000);
}


function showSuccessMessage() {
  const message = document.getElementById('task-success-message');
  if (!message) return;

  message.classList.remove('d-none');
  message.classList.add('show');

  setTimeout(() => {
    message.classList.remove('show');
    message.classList.add('d-none');
  }, 1200);
}


async function addNewTask(taskData) {
  try {
    const response = await fetch(
      "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      }
    );
    const result = await response.json();
    return result; 
  } catch (error) {
    console.error(" Fehler beim Hinzufügen des Tasks:", error);
  }
}






