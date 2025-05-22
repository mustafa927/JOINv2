
/**
 * Fetches all tasks from the backend, calculates summary statistics,
 * identifies the next urgent task due date, and updates the dashboard UI.
 *
 * @async
 * @function sumOfTask
 * @returns {Promise<void>}
 * @throws {Error} If fetching or processing tasks fails.
 */
async function sumOfTask() {
    let url = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks.json";

    try {
        let tasks = await fetchTasks(url);
        let counts = countTasks(tasks);
        let nextUrgentDate = findNextUrgentDate(tasks);
        updateDashboard(counts, nextUrgentDate);
    } catch (error) {
        console.error("Fehler beim Abrufen der Tasks:", error);
    }
}


/**
 * Fetches task data from the given URL and returns the parsed JSON response.
 *
 * @async
 * @function fetchTasks
 * @param {string} url - The endpoint from which to fetch the task data.
 * @returns  The parsed JSON object containing tasks.
 * @throws {Error} If the HTTP response is not OK.
 */
async function fetchTasks(url) {
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Abrufen der Daten: ${response.statusText}`);
    }
    return await response.json();
}


/**
 * Counts tasks by their status and priority and returns a summary object.
 *
 * @function countTasks
 * @param {Object} tasks - An object containing task entries keyed by ID.
 * @returns {Object} An object containing counts for different task categories:
 */
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
        updateStatusCount(task.Status, counts);
        if (task.priority === "Urgent") counts.urgent++;
    }

    return counts;
}


/**
 * Increments the corresponding count in the counts object based on the given task status.
 *
 * @function updateStatusCount
 * @param {string} status - The status of the task (e.g. "To-Do", "Done", "In Progress", "Await Feedback").
 * @param {Object} counts - An object containing count fields that will be updated.
 */
function updateStatusCount(status, counts) {
    switch (status) {
        case "To-Do": counts.todo++; break;
        case "Done": counts.done++; break;
        case "In Progress": counts.inProgress++; break;
        case "Await Feedback": counts.awaiting++; break;
    }
}

/**
 * Finds the nearest upcoming due date among tasks marked as "Urgent".
 *
 * @function findNextUrgentDate
 * @param {Object} tasks - An object where each key is a task ID and the value is a task object.
 * @returns  The closest future due date of an urgent task, or null if none found.
 */
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

/**
 * Updates the dashboard UI elements with task statistics and the next urgent due date.
 *
 * @function updateDashboard
 * @param {Object} counts - An object containing count statistics for tasks.
 */
function updateDashboard(counts, nextDate) {
    setText("todo", counts.todo);
    setText("done", counts.done);
    setText("urgent", counts.urgent);
    setText("tasks-in-board", counts.total);
    setText("tasks-in-progress", counts.inProgress);
    setText("awaiting-feedback", counts.awaiting);

    let dateText = nextDate ? nextDate.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "";

    setText("urgent-date", dateText);
}

/**
 * Sets the text content of a DOM element by its ID.
 *
 * @param {string} id - The ID of the HTML element to update.
 * @param {string|number} value - The text or number to set as the element's content.
 */
function setText(id, value) {
    document.getElementById(id).textContent = value;
}

/**
 * Updates the greeting message in the UI based on the current user stored in localStorage.
 * If a user is found, it displays a personalized greeting with their name.
 * If not, it defaults to a generic greeting.
 */
function updateGreetingMessage() {
    let greetingElement = document.getElementById('greeting-message');
    if (!greetingElement) return;

    let storedUser = localStorage.getItem('currentUser');
    let name = getUserName(storedUser);
    greetingElement.innerHTML = name ? `Good morning, <br><span class="greeting-name">${name}</span>` : "Good morning";
}

/**
 * Extracts and validates the user's name from a stored JSON string.
 * Returns the name if it's not empty or "guest user"; otherwise, returns null.
 *
 * @param {string|null} storedUser - The JSON string of the stored user from localStorage.
 * @returns {string|null} - The validated user name or null if invalid.
 */
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
 * Displays a full-screen greeting overlay for mobile users upon first login.
 * The overlay is shown only if the screen width is less than 768px
 * and the 'newLogin' flag is present in sessionStorage.
 * It uses the stored user from localStorage to display a personalized name,
 * unless the user is marked as a guest.
 *
 * - Creates the overlay dynamically if it does not already exist.
 * - Styles and appends the greeting elements.
 * - Removes the name display if the user is a guest.
 */
function showMobileGreeting() {
    if (window.innerWidth >= 768) return;
    if (!sessionStorage.getItem('newLogin')) return;

    if (!document.getElementById('mobile-greeting-overlay')) {
        let overlay = document.createElement('div');
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

        let greetingText = document.createElement('div');
        greetingText.id = 'mobile-greeting-text';
        greetingText.style.cssText = `
            font-size: 32px;
            color: #2c3e50;
            margin-bottom: 10px;
        `;
        greetingText.textContent = 'Good morning';

        let userName = document.createElement('div');
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

    let storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        let user = JSON.parse(storedUser);
        let nameElement = document.getElementById('mobile-greeting-name');

        if (user.isGuest) {
            nameElement.textContent = '';
        } else {
            nameElement.textContent = user.name || '';
        }
    }

    setTimeout(() => {
        let overlay = document.getElementById('mobile-greeting-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s ease';

            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                sessionStorage.removeItem('newLogin');
            }, 500);
        }
    }, 3000);
}

window.addEventListener('load', () => {
    showMobileGreeting();
});
