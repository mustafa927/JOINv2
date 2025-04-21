import { auth } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const priorityButtons = document.querySelectorAll('.priority-btn');
let activeButton = null;

priorityButtons.forEach(button => {
  button.addEventListener('click', () => {
    const isActive = button.classList.contains('active-urgent') ||
                     button.classList.contains('active-medium') ||
                     button.classList.contains('active-low');

    // Entferne alle aktiven Styles
    priorityButtons.forEach(btn => {
      btn.classList.remove('active-urgent', 'active-medium', 'active-low');
    });

    // Wenn der Button nicht aktiv war → aktiviere ihn
    if (!isActive) {
      if (button.classList.contains('urgent')) {
        button.classList.add('active-urgent');
      } else if (button.classList.contains('medium')) {
        button.classList.add('active-medium');
      } else if (button.classList.contains('low')) {
        button.classList.add('active-low');
      }
    }
  });
});

// Make toggleMenu globally available
window.toggleMenu = function() {
    const menu = document.getElementById("dropdownMenu");
    if (menu) {
        menu.classList.toggle("show");
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