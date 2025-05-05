import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let allUsers = [];

// === PRIORITY BUTTONS ===
const priorityButtons = document.querySelectorAll(".priority-btn");
let activeButton = null;

priorityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const isActive =
      button.classList.contains("active-urgent") ||
      button.classList.contains("active-medium") ||
      button.classList.contains("active-low");

    priorityButtons.forEach((btn) => {
      btn.classList.remove("active-urgent", "active-medium", "active-low");
    });

    if (!isActive) {
      if (button.classList.contains("urgent")) {
        button.classList.add("active-urgent");
      } else if (button.classList.contains("medium")) {
        button.classList.add("active-medium");
      } else if (button.classList.contains("low")) {
        button.classList.add("active-low");
      }
    }
  });
});

// === MENU ===
window.toggleMenu = function () {
  const menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.toggle("show");
};

document.addEventListener("click", function (e) {
  const profile = document.querySelector(".profile-wrapper");
  const menu = document.getElementById("dropdownMenu");
  if (profile && menu && !profile.contains(e.target)) {
    menu.classList.remove("show");
  }
});

// === LOGOUT ===
async function handleLogout() {
  try {
    await signOut(auth);
    localStorage.removeItem("currentUser");
    window.location.href = "Index.html";
  } catch (error) {
    console.error("Error during logout:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.querySelector(
    '#dropdownMenu a[href="index.html"]'
  );
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
});

// === ASSIGNED TO DROPDOWN ===
let url =
  "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json";

async function assignedToInput() {
  let response = await fetch(url);
  let data = await response.json();
  let users = Object.values(data);

  allUsers = users;
  renderUserList();

  let storedUser = localStorage.getItem("currentUser");
  let currentUser = storedUser ? JSON.parse(storedUser) : null;
  let currentName = currentUser?.name;
  let isGuest = !currentName || currentName === "Guest User";

  let container = document.getElementById("assigned-list");
  container.innerHTML = "";

  if (!isGuest && currentName) {
    let initials = getInitials(currentName);
    let color = getColorFromName(currentName);
    container.innerHTML += `
      <div class="assigned-row" onclick="toggleCheckbox(event)">
        <div class="avatar" style="background-color: ${color}">${initials}</div>
        <span>${currentName} (You)</span>
        <input type="checkbox" class="assigned-checkbox" data-name="${currentName}">
      </div>
    `;
  }

  for (let i = 0; i < users.length; i++) {
    let name = users[i].name;
    if (isGuest || name !== currentName) {
      let initials = getInitials(name);
      let color = getColorFromName(name);
      container.innerHTML += `
        <div class="assigned-row" onclick="toggleCheckbox(event)">
          <div class="avatar" style="background-color: ${color}">${initials}</div>
          <span>${name}</span>
          <input type="checkbox" class="assigned-checkbox" data-name="${name}">
        </div>
      `;
    }
  }
}
function renderUserList(filter = "") {
  let container = document.getElementById("assigned-list");
  container.innerHTML = "";

  let storedUser = localStorage.getItem("currentUser");
  let currentUser = storedUser ? JSON.parse(storedUser) : null;
  let currentName = currentUser?.name;
  let isGuest = !currentName || currentName === "Guest User";

  let lowerFilter = filter.toLowerCase();

  if (!isGuest && currentName && currentName.toLowerCase().includes(lowerFilter)) {
    let initials = getInitials(currentName);
    let color = getColorFromName(currentName);
    container.innerHTML += `
      <div class="assigned-row" onclick="toggleCheckbox(event)">
        <div class="avatar" style="background-color: ${color}">${initials}</div>
        <span>${currentName} (You)</span>
        <input type="checkbox" class="assigned-checkbox" data-name="${currentName}">
      </div>
    `;
  }

  allUsers
    .filter(user => {
      if (!user.name) return false;
      if (!isGuest && user.name === currentName) return false;
      return user.name.toLowerCase().includes(lowerFilter);
    })
    .forEach(user => {
      let initials = getInitials(user.name);
      let color = getColorFromName(user.name);
      container.innerHTML += `
        <div class="assigned-row" onclick="toggleCheckbox(event)">
          <div class="avatar" style="background-color: ${color}">${initials}</div>
          <span>${user.name}</span>
          <input type="checkbox" class="assigned-checkbox" data-name="${user.name}">
        </div>
      `;
    });
}


function toggleAssignedDropdown() {
  let dropdown = document.querySelector(".assigned-dropdown");
  let options = document.getElementById("assigned-list");

  let isOpen = dropdown.classList.contains("open");

  if (isOpen) {
    dropdown.classList.remove("open");
    options.classList.add("d-none");
  } else {
    dropdown.classList.add("open");
    options.classList.remove("d-none");
  }
}


function toggleCheckbox(event) {
  if (event.target.tagName !== "INPUT") {
    let checkbox = event.currentTarget.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
    }
  }

  let row = event.currentTarget;
  row.classList.toggle("active");

  updateSelectedAvatars();
}


// === HELPERS ===
function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  let initials = parts[0][0];
  if (parts.length > 1) initials += parts[1][0];
  return initials.toUpperCase();
}

function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#FF7A00",
    "#9327FF",
    "#6E52FF",
    "#FC71FF",
    "#00BEE8",
    "#1FD7C1",
    "#0038FF",
  ];
  return colors[Math.abs(hash) % colors.length];
}

function updateSelectedAvatars() {
  let container = document.getElementById("selected-avatars");
  container.innerHTML = "";

  let checkedBoxes = document.querySelectorAll(".assigned-checkbox:checked");

  checkedBoxes.forEach(box => {
    let name = box.dataset.name;
    let initials = getInitials(name);
    let color = getColorFromName(name);

    container.innerHTML += `
      <div class="selected-avatar" style="background-color: ${color}">
        ${initials}
      </div>
    `;
  });
}

function openAssignedDropdown() {
  let options = document.getElementById("assigned-list");
  let wrapper = document.querySelector(".assigned-dropdown");

  options.classList.remove("d-none");
  wrapper.classList.add("open");
}

function filterAssignedList() {
  let value = document.getElementById("assigned-search").value;
  renderUserList(value);
}

window.filterAssignedList = filterAssignedList;



// === GLOBAL REGISTRATION FOR HTML ===
window.toggleAssignedDropdown = toggleAssignedDropdown;
window.assignedToInput = assignedToInput;
window.toggleCheckbox = toggleCheckbox;
window.openAssignedDropdown = openAssignedDropdown;
