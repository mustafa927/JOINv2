async function sumOfTask() {
    const url = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der Daten: ${response.statusText}`);
        }

        const data = await response.json();

        let todoCount = 0;
        let doneCount = 0;
        let urgentCount = 0;
        let tasksInBoardCount = 0;
        let tasksInProgressCount = 0;
        let awaitingFeedbackCount = 0;

        // Für das nächste Urgent-Datum
        let nextUrgentDate = null;

        for (const key in data) {
            const task = data[key];
            tasksInBoardCount++;

            const status = task.status;
            const priority = task.priority;
            const dueDate = task.dueDate;

            if (status === "To-Do") {
                todoCount++;
            } else if (status === "Done") {
                doneCount++;
            } else if (status === "In Progress") {
                tasksInProgressCount++;
            } else if (status === "Awaiting Feedback") {
                awaitingFeedbackCount++;
            }

            if (priority === "Urgent") {
                urgentCount++;

                if (dueDate) {
                    const dateObj = new Date(dueDate);
                    const today = new Date();

                    // Nur zukünftige oder heutige Daten berücksichtigen
                    if (dateObj >= today) {
                        if (nextUrgentDate === null || dateObj < nextUrgentDate) {
                            nextUrgentDate = dateObj;
                        }
                    }
                }
            }
        }

        // Textfelder im DOM aktualisieren
        document.getElementById('todo').textContent = todoCount;
        document.getElementById('done').textContent = doneCount;
        document.getElementById('urgent').textContent = urgentCount;
        document.getElementById('tasks-in-board').textContent = tasksInBoardCount;
        document.getElementById('tasks-in-progress').textContent = tasksInProgressCount;
        document.getElementById('awaiting-feedback').textContent = awaitingFeedbackCount;

        // Nächstes Urgent-Datum setzen
        if (nextUrgentDate) {
            document.getElementById('urgent-date').textContent = nextUrgentDate.toLocaleDateString("de-DE");
        } else {
            document.getElementById('urgent-date').textContent = "Kein Datum";
        }

    } catch (error) {
        console.error("Fehler beim Abrufen der Tasks:", error);
    }
}
