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

/**
 * Shows a temporary mobile greeting after login
 * Displays differently for guest users vs registered users
 * Only appears on mobile devices and after fresh login
 */
function showMobileGreeting() {
    // Only run on mobile devices
    if (window.innerWidth >= 768) return;
    
    // Check if this is a fresh login
    if (!sessionStorage.getItem('newLogin')) return;
    
    // Create mobile greeting overlay if it doesn't exist
    if (!document.getElementById('mobile-greeting-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'mobile-greeting-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.95);
            z-index: 2000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
        `;
        
        const greetingText = document.createElement('div');
        greetingText.id = 'mobile-greeting-text';
        greetingText.style.cssText = `
            font-size: 32px;
            color: #2c3e50;
            margin-bottom: 10px;
        `;
        greetingText.textContent = 'Good morning';
        
        const userName = document.createElement('div');
        userName.id = 'mobile-greeting-name';
        userName.style.cssText = `
            font-size: 48px;
            font-weight: bold;
            color: #29abe2;
        `;
        
        overlay.appendChild(greetingText);
        overlay.appendChild(userName);
        document.body.appendChild(overlay);
    }
    
    // Get user data and update greeting
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        const nameElement = document.getElementById('mobile-greeting-name');
        
        if (user.isGuest) {
            nameElement.textContent = '';
        } else {
            nameElement.textContent = user.name || '';
        }
    }
    
    // Remove the greeting after 3 seconds
    setTimeout(() => {
        const overlay = document.getElementById('mobile-greeting-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                // Clear the new login flag
                sessionStorage.removeItem('newLogin');
            }, 500);
        }
    }, 3000);
}

// Run the mobile greeting function when the page loads
window.addEventListener('load', () => {
    showMobileGreeting();
});
