import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let allUsers = [];

const priorityButtons = document.querySelectorAll(".priority-btn");
let activeButton = null;


function handlePriorityClick(button) {
  const isActive = button.classList.contains("active-urgent") ||
                   button.classList.contains("active-medium") ||
                   button.classList.contains("active-low");

  priorityButtons.forEach(btn => {
    btn.classList.remove("active-urgent", "active-medium", "active-low");
  });

  if (!isActive) {
    button.classList.add(getActiveClass(button));
  }
}


function getActiveClass(button) {
  if (button.classList.contains("urgent")) return "active-urgent";
  if (button.classList.contains("medium")) return "active-medium";
  if (button.classList.contains("low")) return "active-low";
  return "";
}


function setupPriorityButtons() {
  priorityButtons.forEach(button => {
    button.addEventListener("click", () => handlePriorityClick(button));
  });
}


function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.toggle("show");
}


function closeMenuOnOutsideClick(e) {
  const profile = document.querySelector(".profile-wrapper");
  const menu = document.getElementById("dropdownMenu");
  if (profile && menu && !profile.contains(e.target)) {
    menu.classList.remove("show");
  }
}


async function handleLogout() {
  try {
    await signOut(auth);
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}


function setupLogout() {
  const logoutBtn = document.querySelector('#dropdownMenu a[href="index.html"]');
  if (logoutBtn) {
    logoutBtn.addEventListener("click", e => {
      e.preventDefault();
      handleLogout();
    });
  }
}


async function assignedToInput() {
  const response = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  const data = await response.json();
  allUsers = Object.entries(data).map(([id, user]) => ({ id, ...user }));

  renderUserList();
}


function renderUserList(filter = "") {
  const container = document.getElementById("assigned-list");
  container.innerHTML = "";

  const currentUser = getCurrentUser();
  const currentName = currentUser?.name;
  const isGuest = !currentName || currentName === "Guest User";
  const lowerFilter = filter.toLowerCase();

  if (!isGuest && currentName?.toLowerCase().includes(lowerFilter)) {
    container.innerHTML += createUserRow(currentName, true);
  }

  allUsers
    .filter(user => user.name && (!currentName || user.name !== currentName))
    .filter(user => user.name.toLowerCase().includes(lowerFilter))
    .forEach(user => {
      container.innerHTML += createUserRow(user.name);
    });
}


function createUserRow(name, isCurrent = false) {
  const user = allUsers.find(u => u.name === name); // ID finden
  const userId = user?.id || "";
  const initials = getInitials(name);
  const color = getColorFromName(name);
  const youLabel = isCurrent ? " (You)" : "";

  return `
    <div class="assigned-row" onclick="toggleCheckbox(event)">
      <div class="avatar" style="background-color: ${color}">${initials}</div>
      <span>${name}${youLabel}</span>
      <input type="checkbox" class="assigned-checkbox" data-name="${name}" data-id="${userId}">
    </div>
  `;
}


function toggleAssignedDropdown(event) {
  const dropdown = document.querySelector(".assigned-dropdown");
  const options = document.getElementById("assigned-list");

  const isOpen = dropdown.classList.contains("open");
  dropdown.classList.toggle("open", !isOpen);
  options.classList.toggle("d-none", isOpen);

  event.stopPropagation(); 
}


function toggleCheckbox(event) {
  if (event.target.tagName !== "INPUT") {
    const checkbox = event.currentTarget.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = !checkbox.checked;
  }

  event.currentTarget.classList.toggle("active");
  updateSelectedAvatars();
}


function updateSelectedAvatars() {
  const container = document.getElementById("selected-avatars");
  container.innerHTML = "";

  document.querySelectorAll(".assigned-checkbox:checked").forEach(box => {
    const name = box.dataset.name;
    container.innerHTML += createSelectedAvatar(name);
  });
}


function createSelectedAvatar(name) {
  const initials = getInitials(name);
  const color = getColorFromName(name);
  return `<div class="selected-avatar" style="background-color: ${color}">${initials}</div>`;
}


function openAssignedDropdown(event) {
  const dropdown = document.querySelector(".assigned-dropdown");
  const options = document.getElementById("assigned-list");

  dropdown.classList.add("open");
  options.classList.remove("d-none");

  event.stopPropagation(); // verhindert Bubbling zu body
}

function filterAssignedList() {
  const value = document.getElementById("assigned-search").value;
  renderUserList(value);
}


function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  const initials = parts[0][0] + (parts[1]?.[0] || "");
  return initials.toUpperCase();
}


function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#FF7A00", "#9327FF", "#6E52FF", "#FC71FF", "#00BEE8", "#1FD7C1", "#0038FF"];
  return colors[Math.abs(hash) % colors.length];
}


function getCurrentUser() {
  const stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
}

function clearForm() {
  // Eingabefelder leeren
  document.getElementById("title").value = "";
  document.getElementById("desc").value = "";
  document.getElementById("due-date").value = "";
  document.getElementById("category").value = "";

  // Fehlermeldungen verstecken
  const errors = ["title-error", "date-error", "category-error"];
  errors.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("d-none");
  });

  // Priorität zurücksetzen
  document.querySelectorAll(".priority-btn").forEach(btn => {
    btn.classList.remove("active-urgent", "active-medium", "active-low");
  });

  // Assigned Checkboxen deaktivieren
  document.querySelectorAll(".assigned-checkbox").forEach(box => {
    box.checked = false;
    box.closest(".assigned-row")?.classList.remove("active");
  });

  const avatarContainer = document.getElementById("selected-avatars");
  if (avatarContainer) avatarContainer.innerHTML = "";

  window.subtasks = [];
  renderSubtaskList();

  const assignedSearch = document.getElementById("assigned-search");
  if (assignedSearch) assignedSearch.value = "";

  const dropdown = document.querySelector(".assigned-dropdown");
  if (dropdown) dropdown.classList.remove("open");

  const assignedList = document.getElementById("assigned-list");
  if (assignedList) assignedList.classList.add("d-none");
}


document.addEventListener("DOMContentLoaded", () => {
  setupPriorityButtons();
  setupLogout();
});

document.addEventListener("DOMContentLoaded", () => {
  const statusFromURL = getStatusFromURL();
  setInitialTaskStatus(statusFromURL);
});

function getStatusFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("status") || "To-Do";
}

function setInitialTaskStatus(status) {

  const hiddenStatusInput = document.getElementById("task-status");
  if (hiddenStatusInput) {
    hiddenStatusInput.value = status;
  }

  window.initialTaskStatus = status;
}







document.addEventListener("click", closeMenuOnOutsideClick);


window.clearForm = clearForm;

window.toggleMenu = toggleMenu;
window.toggleAssignedDropdown = toggleAssignedDropdown;
window.assignedToInput = assignedToInput;
window.toggleCheckbox = toggleCheckbox;
window.openAssignedDropdown = openAssignedDropdown;
window.filterAssignedList = filterAssignedList;
