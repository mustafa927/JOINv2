async function sumOfTask() {
    let url = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json";

    try {
        let tasks = await fetchTasks(url);
        console.log("Fetched tasks:", tasks);
        let counts = countTasks(tasks);
        let nextUrgentDate = findNextUrgentDate(tasks);
        console.log("Ist geladen!");
        console.log("Tasks:", tasks);
        console.log("Zählwerte:", counts);
        updateDashboard(counts, nextUrgentDate);
    } catch (error) {
        console.error("Fehler beim Abrufen der Tasks:", error);
    }
}

async function fetchTasks(url) {
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Abrufen der Daten: ${response.statusText}`);
    }
    return await response.json();
}

function countTasks(tasks) {
    let counts = {
        todo: 0,
        done: 0,
        urgent: 0,
        inProgress: 0,
        awaiting: 0,
        total: 0
    };

    for (let key in tasks) {
        let task = tasks[key];
        counts.total++;
        console.log("Task status:", task.status);
        updateStatusCount(task.Status, counts);
        if (task.priority === "Urgent") counts.urgent++;
    }

    return counts;
}

function updateStatusCount(status, counts) {
    switch (status) {
        case "To-Do": counts.todo++; break;       
        case "Done": counts.done++; break;
        case "In Progress": counts.inProgress++; break;
        case "Await Feedback": counts.awaiting++; break;
    }
}

function findNextUrgentDate(tasks) {
    let nextDate = null;
    let today = new Date();

    for (let key in tasks) {
        let task = tasks[key];
        if (task.priority !== "Urgent" || !task.dueDate) continue;

        let dueDate = new Date(task.dueDate);
        if (dueDate >= today && (!nextDate || dueDate < nextDate)) {
            nextDate = dueDate;
        }
    }

    return nextDate;
}

function updateDashboard(counts, nextDate) {
    setText("todo", counts.todo);
    setText("done", counts.done);
    setText("urgent", counts.urgent);
    setText("tasks-in-board", counts.total);
    setText("tasks-in-progress", counts.inProgress);
    setText("awaiting-feedback", counts.awaiting);

    let dateText = nextDate ? nextDate.toLocaleDateString("de-DE") : "";
    setText("urgent-date", dateText);
}

function setText(id, value) {
    document.getElementById(id).textContent = value;
}

function updateGreetingMessage() {
    let greetingElement = document.getElementById('greeting-message');
    if (!greetingElement) return;

    let storedUser = localStorage.getItem('currentUser');
    let name = getUserName(storedUser);
    greetingElement.innerHTML = name ? `Good morning, <br><span class="greeting-name">${name}</span>` : "Good morning";
}

function getUserName(storedUser) {
    if (!storedUser) return null;
    let user = JSON.parse(storedUser);
    let name = user.name?.trim().toLowerCase();
    return name && name !== "guest user" ? user.name : null;
}

window.addEventListener('load', () => {
    updateGreetingMessage();
});
