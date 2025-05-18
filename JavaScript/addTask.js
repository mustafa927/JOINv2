import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let allUsers = [];
let priorityButtons = document.querySelectorAll(".priority-btn");
let activeButton = null;


/**
 * Handles the active styling when a priority button is clicked.
 * 
 * @param {HTMLElement} button - The clicked priority button.
 */
function handlePriorityClick(button) {
  let isActive = button.classList.contains("active-urgent") ||
                 button.classList.contains("active-medium") ||
                 button.classList.contains("active-low");

  priorityButtons.forEach(btn => {
    btn.classList.remove("active-urgent", "active-medium", "active-low");

    // Stelle Standard-Icons wieder her
    if (btn.classList.contains("urgent")) {
      btn.querySelector("img").src = "svg/urgent.svg";
    } else if (btn.classList.contains("medium")) {
      btn.querySelector("img").src = "svg/medium.svg";
    } else if (btn.classList.contains("low")) {
      btn.querySelector("img").src = "svg/low.svg";
    }
  });

  if (!isActive) {
    const activeClass = getActiveClass(button);
    button.classList.add(activeClass);

    // Setze aktives Icon
    if (button.classList.contains("urgent")) {
      button.querySelector("img").src = "svg/urgentwhite.svg";
    } else if (button.classList.contains("medium")) {
      button.querySelector("img").src = "svg/mediumwhite.svg";
    } else if (button.classList.contains("low")) {
      button.querySelector("img").src = "svg/lowwhite.svg";
    }
  }
}


/**
 * Returns the appropriate active class name based on the priority button.
 * 
 * @param {HTMLElement} button - The button element to evaluate.
 * @returns {string} - The class name representing the active state.
 */
function getActiveClass(button) {
  if (button.classList.contains("urgent")) return "active-urgent";
  if (button.classList.contains("medium")) return "active-medium";
  if (button.classList.contains("low")) return "active-low";
  return "";
}

/**
 * Adds event listeners to all priority buttons for click handling.
 * 
 */
function setupPriorityButtons() {
  priorityButtons.forEach(btn => btn.addEventListener("click", () => handlePriorityClick(btn)));
}


/**
 * Toggles the profile dropdown menu open or closed.
 * 
 */
function toggleMenu() {
  let menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.toggle("show");
}

/**
 * Closes the profile dropdown menu when clicking outside.
 * 
 * @param {MouseEvent} e - The click event.
 */
function closeMenuOnOutsideClick(e) {
  let profile = document.querySelector(".profile-wrapper");
  let menu = document.getElementById("dropdownMenu");
  if (profile && menu && !profile.contains(e.target)) menu.classList.remove("show");
}

/**
 * Logs out the user and redirects to the login page.
 * 
 */
async function handleLogout() {
  try {
    await signOut(auth);
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

/**
 * Adds a click handler to the logout link.
 * 
 */
function setupLogout() {
  let logoutBtn = document.querySelector('#dropdownMenu a[href="index.html"]');
  if (logoutBtn) logoutBtn.addEventListener("click", e => {
    e.preventDefault();
    handleLogout();
  });
}

/**
 * Fetches all users from Firebase and populates the assigned-to list.
 * 
 */
async function assignedToInput() {
  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  let data = await res.json();
  allUsers = Object.entries(data).map(([id, user]) => ({ id, ...user }));
  renderUserList();
}

/**
 * Renders the list of users available for assignment.
 * 
 * @param {string} [filter=""] - Optional name filter for searching users.
 */
function renderUserList(filter = "") {
  let container = document.getElementById("assigned-list");
  container.innerHTML = "";
  let current = getCurrentUser();
  let currentName = current?.name;
  let isGuest = !currentName || currentName === "Guest User";
  let lower = filter.toLowerCase();
  if (!isGuest && currentName?.toLowerCase().includes(lower)) container.innerHTML += userRowTemplate(currentName, true);
  allUsers.filter(u => u.name && (!currentName || u.name !== currentName) && u.name.toLowerCase().includes(lower)).forEach(u => {
    container.innerHTML += userRowTemplate(u.name);
  });
}

/**
 * Toggles the visibility of the assigned dropdown list.
 * 
 * @param {MouseEvent} e - The click event.
 */
function toggleAssignedDropdown(e) {
  let dropdown = document.querySelector(".assigned-dropdown");
  let options = document.getElementById("assigned-list");
  let isOpen = dropdown.classList.contains("open");
  dropdown.classList.toggle("open", !isOpen);
  options.classList.toggle("d-none", isOpen);
  e.stopPropagation();
}

/**
 * Toggles checkbox selection and avatar highlighting.
 * 
 * @param {MouseEvent} e - The click event.
 */
function toggleCheckbox(e) {
  if (e.target.tagName !== "INPUT") {
    let checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = !checkbox.checked;
  }
  e.currentTarget.classList.toggle("active");
  updateSelectedAvatars();
}

/**
 * Updates the display of selected user avatars based on checked boxes.
 * 
 */
function updateSelectedAvatars() {
  let container = document.getElementById("selected-avatars");
  container.innerHTML = "";
  document.querySelectorAll(".assigned-checkbox:checked").forEach(box => {
    container.innerHTML += avatarTemplate(box.dataset.name);
  });
}

/**
 * Opens the assigned user dropdown.
 * 
 * @param {MouseEvent} e - The click event.
 */
function openAssignedDropdown(e) {
  let dropdown = document.querySelector(".assigned-dropdown");
  let options = document.getElementById("assigned-list");
  dropdown.classList.add("open");
  options.classList.remove("d-none");
  e.stopPropagation();
}

/**
 * Filters the assigned user list by input value.
 * 
 */
function filterAssignedList() {
  let value = document.getElementById("assigned-search").value;
  renderUserList(value);
}

/**
 * Returns the initials from a given name.
 * 
 * @param {string} name - Full name of the user.
 * @returns {string} - The initials.
 */
function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

/**
 * Generates a color based on the given name (consistent hash).
 * 
 * @param {string} name - The name to derive a color from.
 * @returns {string} - A hex color code.
 */
function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  let colors = ["#FF7A00", "#9327FF", "#6E52FF", "#FC71FF", "#00BEE8", "#1FD7C1", "#0038FF"];
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Retrieves the current logged-in user from local storage.
 * 
 * @returns {Object|null} - The current user object or null.
 */
function getCurrentUser() {
  let stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
}

/**
 * Clears the entire form and resets all inputs and UI states.
 * 
 */
function clearForm() {
  ["title", "desc", "due-date", "category"].forEach(id => document.getElementById(id).value = "");
  ["title-error", "date-error", "category-error"].forEach(id => document.getElementById(id)?.classList.add("d-none"));
  document.querySelectorAll(".priority-btn").forEach(btn => btn.classList.remove("active-urgent", "active-medium", "active-low"));
  document.querySelectorAll(".assigned-checkbox").forEach(box => {
    box.checked = false;
    box.closest(".assigned-row")?.classList.remove("active");
  });
  document.getElementById("selected-avatars").innerHTML = "";
  window.subtasks = [];
  renderSubtaskList();
  document.getElementById("assigned-search").value = "";
  document.querySelector(".assigned-dropdown")?.classList.remove("open");
  document.getElementById("assigned-list")?.classList.add("d-none");
}

document.addEventListener("DOMContentLoaded", () => {
  setupPriorityButtons();
  setupLogout();
  let status = new URLSearchParams(window.location.search).get("status") || "To-Do";
  let statusInput = document.getElementById("task-status");
  if (statusInput) statusInput.value = status;
  window.initialTaskStatus = status;
});

document.addEventListener("click", closeMenuOnOutsideClick);

window.clearForm = clearForm;
window.toggleMenu = toggleMenu;
window.toggleAssignedDropdown = toggleAssignedDropdown;
window.assignedToInput = assignedToInput;
window.toggleCheckbox = toggleCheckbox;
window.openAssignedDropdown = openAssignedDropdown;
window.filterAssignedList = filterAssignedList;


/**
 * Generates the HTML for a user row in the assigned-to list.
 * 
 * @param {string} name - The name of the user.
 * @param {boolean} [isCurrent=false] - Whether the user is the current user.
 * @returns {string} - HTML string of the user row.
 */
function userRowTemplate(name, isCurrent = false) {
  let user = allUsers.find(u => u.name === name);
  let userId = user?.id || "";
  let initials = getInitials(name);
  let color = getColorFromName(name);
  let youLabel = isCurrent ? " (You)" : "";
  return `
    <div class="assigned-row" onclick="toggleCheckbox(event)">
      <div class="avatar" style="background-color: ${color}">${initials}</div>
      <span>${name}${youLabel}</span>
      <input type="checkbox" class="assigned-checkbox" data-name="${name}" data-id="${userId}">
    </div>
  `;
}

/**
 * Generates the HTML for a selected user avatar.
 * 
 * @param {string} name - The name of the user.
 * @returns {string} - HTML string of the avatar.
 */
function avatarTemplate(name) {
  let initials = getInitials(name);
  let color = getColorFromName(name);
  return `<div class="selected-avatar" style="background-color: ${color}">${initials}</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("assigned-select");

  dropdown.addEventListener("focusin", () => {
    dropdown.classList.add("input-focus");
  });

  dropdown.addEventListener("focusout", () => {
    dropdown.classList.remove("input-focus");
  });
});

 document.addEventListener("click", function (event) {
    const dropdown = document.querySelector(".assigned-dropdown");
    const assignedList = document.getElementById("assigned-list");

    if (dropdown && !dropdown.contains(event.target)) {
      dropdown.classList.remove("open");
      assignedList.classList.add("d-none");
    }
  });