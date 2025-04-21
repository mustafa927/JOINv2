import { auth } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let draggedElement;

// Make drag-and-drop functions globally available
window.startDragging = function(event) {
  draggedElement = event.target;
}

window.allowDrop = function(event) {
  event.preventDefault();
}

window.drop = function(event) {
  event.preventDefault();
  const dropzone = event.currentTarget;

  if (draggedElement && dropzone.classList.contains('dropzone')) {
    dropzone.appendChild(draggedElement);

    const noTasksMessage = dropzone.querySelector('.no-tasks');
    if (noTasksMessage) {
      noTasksMessage.classList.add('d-none');
    }
    checkEmptySections();
  }
}

function checkEmptySections() {
    document.querySelectorAll('.progress-section').forEach(section => {
      const cards = section.querySelectorAll('.card');
      const noTasks = section.querySelector('.no-tasks');
      
      if (cards.length === 0 && noTasks) {
        noTasks.classList.remove('d-none');
      } else if (cards.length > 0 && noTasks) {
        noTasks.classList.add('d-none');
      }
    });
}

// Make toggleMenu globally available
window.toggleMenu = function() {
    const menu = document.getElementById("dropdownMenu");
    if (menu) {
        menu.classList.toggle("show");
    }
}

// Make toggleDropdown globally available
window.toggleDropdown = function() {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

// Close menu when clicking outside
document.addEventListener("click", function (e) {
    const profile = document.querySelector(".profile-wrapper");
    const menu = document.getElementById("dropdownMenu");
    if (profile && menu && !profile.contains(e.target)) {
        menu.classList.remove("show");
    }
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