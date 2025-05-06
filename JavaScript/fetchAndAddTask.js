// let allTasks = [];

window.allTasks = []; 

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
  
  // Prüfen, ob Tasks existieren
  if (data) {
    let tasks = Object.values(data); // Array aus den Tasks machen
    console.log("Aufgaben geladen:", tasks);

    // Hier das Array allTasks füllen
    allTasks = tasks;
  } else {
    console.log("Keine Aufgaben gefunden.");
  }

  // Optional: Funktion zum Rendern der Aufgaben auf der Seite aufrufen
  // renderTasks();
}


async function getAllTasksWithPeople() {
  try {
    // Alle Tasks abrufen
    const tasksRes = await fetch(
      "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json"
    );
    const tasksData = await tasksRes.json();

    if (!tasksData) {
      console.log("📭 Keine Tasks gefunden.");
      return [];
    }

    // Alle Personen abrufen
    const peopleRes = await fetch(
      "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json"
    );
    const peopleData = await peopleRes.json();

    // Tasks mit Personendaten anreichern
    const tasksArray = Object.entries(tasksData).map(([id, task]) => {
      const assignedTo = task.assignedTo || {}; // z. B. { person1: "-OO2cpz..." }

      const assignedPeople = Object.values(assignedTo).map(personId => {
        const person = peopleData?.[personId];
        return person ? { id: personId, ...person } : { id: personId, name: "Unbekannt" };
      });

      return {
        id,
        ...task,
        assignedPeople
      };
    });
    window.allTasks = tasksArray;

    console.log("📋 allTasks globally gesetzt:", window.allTasks);
    return tasksArray;

  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Tasks mit Personen:", error);
    return [];
  }
}


function createTaskFromForm() {
  // 🟢 Titel prüfen
  const titleInput = document.getElementById("title").value.trim();
  if (!titleInput) {
    document.getElementById("title-error").classList.remove("d-none");
    return;
  }
  document.getElementById("title-error").classList.add("d-none");

  // 📝 Description
  const descriptionInput = document.getElementById("desc").value.trim();

  // 📅 Due Date
  const dueDateInput = document.getElementById("due-date").value;

  // 🔥 Priority (aktive Klasse erkennen)
  const priorityButtons = document.querySelectorAll(".priority-buttons .priority-btn");
  let selectedPriority = "";
  priorityButtons.forEach(btn => {
    if (btn.classList.contains("active-urgent")) selectedPriority = "Urgent";
    if (btn.classList.contains("active-medium")) selectedPriority = "Medium";
    if (btn.classList.contains("active-low")) selectedPriority = "Low";
  });

  // 🧠 Kategorie prüfen
  const categoryInput = document.getElementById("category").value;
  if (!categoryInput) {
    document.getElementById("category-error").classList.remove("d-none");
    return;
  }
  document.getElementById("category-error").classList.add("d-none");

  // ✅ Subtasks einsammeln
  const subtaskElements = document.querySelectorAll("#subtask-list .subtask-text");
  const subtasks = {};
  subtaskElements.forEach((el, index) => {
    const key = `sub${index + 1}`;
    subtasks[key] = {
      title: el.textContent.trim(),
      done: false
    };
  });

  // ✅ Assigned To IDs einsammeln
  const checkedBoxes = document.querySelectorAll(".assigned-checkbox:checked");
  const assignedTo = {};
  checkedBoxes.forEach((box, index) => {
    const userId = box.dataset.id;
    if (userId) {
      assignedTo[`person${index + 1}`] = userId;
    }
  });

  // 📦 newTask erstellen
  let newTask = {
    title: titleInput,
    description: descriptionInput,
    dueDate: dueDateInput,
    priority: selectedPriority,
    category: categoryInput,
    Status: "To-Do",
    assignedTo: assignedTo,
    subtasks: subtasks
  };

  console.log("📦 Finaler Task:", newTask);

  addNewTask(newTask);

  showSuccessMessage()

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
    console.log("✅ Task erfolgreich hinzugefügt:", result);
    return result; // enthält z.B. { name: "-NT...123" }
  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen des Tasks:", error);
  }
}






