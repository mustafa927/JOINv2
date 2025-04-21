import { auth, db } from './firebase.js';
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Check if user is logged in
function checkAuth() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        // Check localStorage for guest user
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            window.location.href = 'Index.html';
            return;
        }
    }
}

// Display user information
function displayUserInfo() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = userData.name || 'Guest User';
        }
    }
}

// Load tasks from Firestore
async function loadTasks() {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return;
        }

        const tasksRef = collection(db, "users", currentUser.uid, "tasks");
        const querySnapshot = await getDocs(tasksRef);
        
        let tasksInBoard = 0;
        let tasksInProgress = 0;
        let awaitingFeedback = 0;
        let urgentTasks = 0;
        
        const todoTasks = [];
        const inProgressTasks = [];
        const awaitingFeedbackTasks = [];
        const doneTasks = [];

        querySnapshot.forEach((doc) => {
            const task = doc.data();
            tasksInBoard++;
            
            switch (task.status) {
                case 'todo':
                    todoTasks.push(task);
                    break;
                case 'inProgress':
                    tasksInProgress++;
                    inProgressTasks.push(task);
                    break;
                case 'awaitingFeedback':
                    awaitingFeedback++;
                    awaitingFeedbackTasks.push(task);
                    break;
                case 'done':
                    doneTasks.push(task);
                    break;
            }

            if (task.priority === 'urgent') {
                urgentTasks++;
            }
        });

        // Update counters
        document.getElementById('tasksInBoard').textContent = tasksInBoard;
        document.getElementById('tasksInProgress').textContent = tasksInProgress;
        document.getElementById('awaitingFeedback').textContent = awaitingFeedback;
        document.getElementById('urgentTasks').textContent = urgentTasks;

        // Display tasks in their respective sections
        displayTasks('todoTasks', todoTasks);
        displayTasks('inProgressTasks', inProgressTasks);
        displayTasks('awaitingFeedbackTasks', awaitingFeedbackTasks);
        displayTasks('doneTasks', doneTasks);

    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Display tasks in the UI
function displayTasks(containerId, tasks) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-description">${task.description || ''}</div>
            <div class="task-priority ${task.priority}">${task.priority}</div>
        `;
        container.appendChild(taskElement);
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    displayUserInfo();
    loadTasks();
});

// Handle logout
async function handleLogout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        window.location.href = 'Index.html';
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

// Add event listener for logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('#dropdownMenu a[href="index.html"]');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});