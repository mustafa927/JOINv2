let allTasks = [];

let newTask = {
  title: "Kanban UI bauen",
  description: "UI für Task-Overlay erstellen",
  dueDate: "2025-06-10",
  priority: "High",
  category: "Design",
  status: "To-Do",
  assignedTo: {
    person1: "-OO2cpzcQaVpB2cvHgCp",
    person2: "-OONRhAG3up-91-RGtpa"
  },
  subtasks: {
    sub1: {
      title: "HTML/CSS Grundstruktur",
      done: false
    },
    sub2: {
      title: "JS Integration",
      done: true
    }
  }
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

    console.log("📋 Alle Tasks mit Personen:", tasksArray);
    return tasksArray;

  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Tasks mit Personen:", error);
    return [];
  }
}



// async function addNewTask(taskData) {
//   try {
//     const response = await fetch(
//       "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(taskData)
//       }
//     );

//     const result = await response.json();
//     console.log("✅ Task erfolgreich hinzugefügt:", result);
//     return result; // enthält z.B. { name: "-NT...123" }
//   } catch (error) {
//     console.error("❌ Fehler beim Hinzufügen des Tasks:", error);
//   }
// }



// addNewTask(newTask); 


