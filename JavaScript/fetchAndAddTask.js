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
