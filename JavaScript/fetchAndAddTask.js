

window.allTasks = []; 

/**
 * Determines the task status based on the URL or parent window context.
 * 
 * @returns {string} - The current task status (default: "To-Do")
 */
function getTaskStatus() {
  const fromURL = new URLSearchParams(window.location.search).get("status");
  return fromURL || window.parent?.currentTaskStatus || "To-Do";
}

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


/**
 * Fetches tasks from Firebase and stores them in the global `allTasks` array.
 * 
 * @async
 */
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

/**
 * Fetches all tasks and enriches them with user data.
 * 
 * @returns {Promise<Array>} - List of enriched task objects
 */
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

/**
 * Fetches task data from Firebase.
 * 
 * @returns {Promise<Object>} - Raw tasks data
 */
async function fetchTasks() {
  const response = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json");
  return await response.json();
}

/**
 * Fetches user data from Firebase.
 * 
 * @returns {Promise<Object>} - Raw people data
 */
async function fetchPeople() {
  const response = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  return await response.json();
}

/**
 * Enriches tasks with corresponding user data.
 * 
 * @param {Object} tasksData - Task data from Firebase
 * @param {Object} peopleData - People data from Firebase
 * @returns {Array} - Array of tasks with assignedPeople info
 */
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



/**
 * Validates form fields, builds task, submits it and redirects.
 * 
 */
function createTaskFromForm() {
  if (!validateRequiredFields()) return;

  const newTask = buildNewTask();

  addNewTask(newTask);
  showSuccessMessage();
  redirectToBoard();
}

/**
 * Validates required input fields.
 * 
 * @returns {boolean} - True if all required fields are valid
 */
function validateRequiredFields() {
  const titleValid = validateField("title", "title-error");
  const dateValid = validateField("due-date", "date-error");
  const categoryValid = validateField("category", "category-error");
  return titleValid && dateValid && categoryValid;
}

/**
 * Validates a single input field.
 * 
 * @param {string} inputId - ID of input element
 * @param {string} errorId - ID of error element
 * @returns {boolean} - True if valid
 */
function validateField(inputId, errorId) {
  const value = document.getElementById(inputId).value.trim();
  const error = document.getElementById(errorId);

  if (!value) {
    showTemporaryError(error);
    return false;
  }
  return true;
}

/**
 * Temporarily displays an error element.
 * 
 * @param {HTMLElement} errorElement - Element to show
 */
function showTemporaryError(errorElement) {
  errorElement.classList.remove("d-none");
  setTimeout(() => errorElement.classList.add("d-none"), 3000);
}


/**
 * Form handler for modal-based task creation.
 * 
 */
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

/**
 * Closes the task creation modal and clears its contents.
 * 
 */
function closeAddTaskModal() {
  document.getElementById("addTaskModal").classList.add("d-none");
  document.getElementById("addTaskIframe").src = "about:blank";
}

/**
 * Called after a task is created from within an iframe/modal.
 * 
 */
function handleTaskCreated() {
  closeAddTaskModal();
  location.reload(); 
}

/**
 * Validates task title.
 * 
 * @returns {boolean} - True if valid
 */
function validateTitle() {
  const title = document.getElementById("title").value.trim();
  const error = document.getElementById("title-error");
  const isValid = !!title;
  error.classList.toggle(isValid);
  return isValid;
}

/**
 * Validates task category.
 * 
 * @returns {boolean} - True if valid
 */
function validateCategory() {
  const category = document.getElementById("category").value;
  const error = document.getElementById("category-error");
  const isValid = !!category;
  error.classList.toggle(isValid);
  return isValid;
}

/**
 * Builds a new task object based on form inputs.
 * 
 * @returns {Object} - Task object
 */
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

/**
 * Gets the trimmed value of an input field by ID.
 * 
 * @param {string} id - Input element ID
 * @returns {string}
 */
function getValue(id) {
  return document.getElementById(id).value.trim();
}

/**
 * Determines which priority button is currently selected.
 * 
 * @returns {string} - Priority string (Urgent, Medium, Low, or empty)
 */
function getSelectedPriority() {
  const buttons = document.querySelectorAll(".priority-btn");
  for (let btn of buttons) {
    if (btn.classList.contains("active-urgent")) return "Urgent";
    if (btn.classList.contains("active-medium")) return "Medium";
    if (btn.classList.contains("active-low")) return "Low";
  }
  return "";
}

/**
 * Collects subtasks from the DOM and builds a subtasks object.
 * 
 * @returns {Object} - Subtask entries by ID
 */
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

/**
 * Collects checked user IDs from assigned checkboxes.
 * 
 * @returns {Object} - Assigned users keyed by personX
 */
function collectAssignedUserIds() {
  const boxes = document.querySelectorAll(".assigned-checkbox:checked");
  const assigned = {};
  boxes.forEach((box, i) => {
    const id = box.dataset.id;
    if (id) assigned[`person${i + 1}`] = id;
  });
  return assigned;
}

/**
 * Redirects the user to the board page after task creation.
 * 
 */
function redirectToBoard() {
  setTimeout(() => {
    window.location.href = "boardsection.html";
  }, 1000);
}


/**
 * Displays the "Task created" success message briefly.
 * 
 */
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

/**
 * Sends a new task to Firebase for saving.
 * 
 * @param {Object} taskData - The task object to store
 * @returns {Promise<Object>} - Firebase response
 */
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






