let allTasks = [];

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


async function fetchTaskWithAssignedPerson() {
    console.log(fetchstart);
    try {
      // Tasks laden
      const taskRes = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/task1.json");
      const task = await taskRes.json();
  
      // Person-ID aus Task extrahieren
      const personId = task.assignedTo;
  
      // Person laden
      const personRes = await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person/${personId}.json`);
      const person = await personRes.json();
  
      // Kombinieren und loggen
      const enrichedTask = {
        ...task,
        assignedPerson: {
          id: personId,
          ...person
        }
      };
  
      console.log("🧑‍💻 Enriched Task:", enrichedTask);
      return enrichedTask;
    } catch (error) {
      console.error("Fehler beim Abrufen:", error);
    }
  }
  