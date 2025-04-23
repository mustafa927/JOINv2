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


// firebase url

let url = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json";

async function assignedToInput() {
  let call = await fetch(url);
  let data = await call.json();

  let assigned = document.getElementById("assigned");
  assigned.innerHTML = ""; // Vorherige Inhalte löschen

  let keys = Object.keys(data);

  for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let person = data[key];
      let initials = getInitials(person.name);
      let color = getColorFromName(person.name);

      let item = document.createElement("div");
      item.classList.add("assigned-item");

      item.innerHTML = `
          <div class="avatar" style="background-color: ${color};">
              ${initials}
          </div>
          <span class="name">${person.name}</span>
      `;

      assigned.appendChild(item);
  }
}


window.assignedToInput = assignedToInput;

function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  let initials = parts[0][0];
  if (parts.length > 1) initials += parts[1][0];
  return initials.toUpperCase();
}

function getColorFromName(name) {
  // Einfache Hash-Funktion für konsistente Farben
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#FF7A00', '#9327FF', '#6E52FF', '#FC71FF', '#00BEE8', '#1FD7C1', '#0038FF'];
  return colors[Math.abs(hash) % colors.length];
}
// vom design her brauche ich links noch die initialien in farben
// ich brauche den current user 
// ich brauche rechts eine checkbox die onclick dann einhakt
// und ihc brauche multi auswahl und onclick auf den create task button 