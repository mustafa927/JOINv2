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

        for (const key in data) {
            const task = data[key];
            tasksInBoardCount++; // Jede Aufgabe zählt

            if (task.Status === "To-Do") {
                todoCount++;
            } else if (task.Status === "Done") {
                doneCount++;
            } else if (task.Status === "In Progress") {
                tasksInProgressCount++;
            } else if (task.Status === "Awaiting Feedback") {
                awaitingFeedbackCount++;
            }

            if (task.Priority === "Urgent") {
                urgentCount++;
            }
        }

        // Direkt updaten ohne ifs
        document.getElementById('todo').textContent = todoCount;
        document.getElementById('done').textContent = doneCount;
        document.getElementById('urgent').textContent = urgentCount;
        document.getElementById('tasks-in-board').textContent = tasksInBoardCount;
        document.getElementById('tasks-in-progress').textContent = tasksInProgressCount;
        document.getElementById('awaiting-feedback').textContent = awaitingFeedbackCount;

    } catch (error) {
        console.error("Fehler beim Abrufen der Tasks:", error);
    }
}

sumOfTask();