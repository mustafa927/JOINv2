async function sumOfTask() {
    const url = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json";

    try {
        const tasks = await fetchTasks(url);
        const counts = countTasks(tasks);
        const nextUrgentDate = findNextUrgentDate(tasks);

        updateDashboard(counts, nextUrgentDate);
    } catch (error) {
        console.error("Fehler beim Abrufen der Tasks:", error);
    }
}

async function fetchTasks(url) {
    const response = await fetch(url);
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

    for (const key in tasks) {
        const task = tasks[key];
        counts.total++;
        updateStatusCount(task.status, counts);
        if (task.priority === "Urgent") counts.urgent++;
    }

    return counts;
}

function updateStatusCount(status, counts) {
    switch (status) {
        case "To-Do": counts.todo++; break;
        case "Done": counts.done++; break;
        case "In Progress": counts.inProgress++; break;
        case "Awaiting Feedback": counts.awaiting++; break;
    }
}

function findNextUrgentDate(tasks) {
    let nextDate = null;
    const today = new Date();

    for (const key in tasks) {
        const task = tasks[key];
        if (task.priority !== "Urgent" || !task.dueDate) continue;

        const dueDate = new Date(task.dueDate);
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

    const dateText = nextDate ? nextDate.toLocaleDateString("de-DE") : "Kein Datum";
    setText("urgent-date", dateText);
}

function setText(id, value) {
    document.getElementById(id).textContent = value;
}

function updateGreetingMessage() {
    const greetingElement = document.getElementById('greeting-message');
    const storedUser = localStorage.getItem('currentUser');

    const name = getUserName(storedUser);
    greetingElement.textContent = name ? `Good morning, ${name}` : "Good morning";
}

function getUserName(storedUser) {
    if (!storedUser) return null;
    const user = JSON.parse(storedUser);
    const name = user.name?.trim().toLowerCase();
    return name && name !== "guest user" ? user.name : null;
}
