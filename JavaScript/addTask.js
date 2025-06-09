import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let allUsers = [];
let priorityButtons = document.querySelectorAll(".priority-btn");
let activeButton = null;

/**
 * Handles the click event on a priority button.
 * Updates the active class and icon based on current state.
 * @param {HTMLElement} button - The clicked priority button.
 */
function handlePriorityClick(button) {
  let isActive = button.classList.contains("active-urgent") ||
                 button.classList.contains("active-medium") ||
                 button.classList.contains("active-low");

  priorityButtons.forEach(btn => {
    btn.classList.remove("active-urgent", "active-medium", "active-low");
    if (btn.classList.contains("urgent")) {
      btn.querySelector("img").src = "svg/urgent.svg";
    } else if (btn.classList.contains("medium")) {
      btn.querySelector("img").src = "svg/medium.svg";
    } else if (btn.classList.contains("low")) {
      btn.querySelector("img").src = "svg/low.svg";
    }
  });

  if (!isActive) {
    let activeClass = getActiveClass(button);
    button.classList.add(activeClass);
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
 * Returns the active class string based on the button's priority type.
 * @param {HTMLElement} button - The button to check.
 * @returns {string} - CSS class representing the active state.
 */
function getActiveClass(button) {
  if (button.classList.contains("urgent")) return "active-urgent";
  if (button.classList.contains("medium")) return "active-medium";
  if (button.classList.contains("low")) return "active-low";
  return "";
}

/**
 * Attaches click listeners to all priority buttons.
 */
function setupPriorityButtons() {
  priorityButtons.forEach(btn => btn.addEventListener("click", () => handlePriorityClick(btn)));
}

/**
 * Toggles visibility of the profile dropdown menu.
 */
function toggleMenu() {
  let menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.toggle("show");
}

/**
 * Closes dropdown menu if user clicks outside the profile area.
 * @param {MouseEvent} e - Click event.
 */
function closeMenuOnOutsideClick(e) {
  let profile = document.querySelector(".profile-wrapper");
  let menu = document.getElementById("dropdownMenu");
  if (profile && menu && !profile.contains(e.target)) menu.classList.remove("show");
}

/**
 * Logs out the current user using Firebase Authentication.
 * Clears local storage and redirects to login page.
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
 * Sets up the logout functionality by attaching event listener.
 */
function setupLogout() {
  let logoutBtn = document.querySelector('#dropdownMenu a[href="index.html"]');
  if (logoutBtn) logoutBtn.addEventListener("click", e => {
    e.preventDefault();
    handleLogout();
  });
}
/**
 * Fetches user data from Firebase and populates the assigned user list.
 */
async function assignedToInput() {
  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  let data = await res.json();
  allUsers = Object.entries(data).map(([id, user]) => ({ id, ...user }));
  renderUserList();
}

/**
 * Renders the list of assignable users, filtered by name.
 * @param {string} [filter=\"\"] - Text to filter user names.
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
 * Toggles visibility of the assigned-to dropdown.
 * @param {MouseEvent} e - Click event.
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
 * Toggles the checkbox state inside an assigned row and updates avatar display.
 * @param {MouseEvent} e - Click event.
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
 * Updates the UI to show selected avatars based on checked users.
 */
function updateSelectedAvatars() {
  let container = document.getElementById("selected-avatars");
  container.innerHTML = "";
  const checkedBoxes = Array.from(document.querySelectorAll(".assigned-checkbox:checked"));
  const maxVisible = 2;
  checkedBoxes.slice(0, maxVisible).forEach(box => {
    container.innerHTML += avatarTemplate(box.dataset.name);
  });

  const remaining = checkedBoxes.length - maxVisible;
  if (remaining > 0) {
    container.innerHTML += `
      <div class="selected-avatar" style="background-color: #ccc">+${remaining}</div>
    `;
  }
}

/**
 * Opens the assigned dropdown menu.
 * @param {MouseEvent} e - Click event.
 */
function openAssignedDropdown(e) {
  let dropdown = document.querySelector(".assigned-dropdown");
  let options = document.getElementById("assigned-list");
  dropdown.classList.add("open");
  options.classList.remove("d-none");
  e.stopPropagation();
}

/**
 * Filters the assigned user list based on input search text.
 */
function filterAssignedList() {
  let value = document.getElementById("assigned-search").value;
  renderUserList(value);
}

/**
 * Extracts and returns initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} - Initials.
 */
function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

/**
 * Generates a color value based on the given name string.
 * @param {string} name - The input name.
 * @returns {string} - Hex color.
 */
function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  let colors = ["#FF7A00", "#9327FF", "#6E52FF", "#FC71FF", "#00BEE8", "#1FD7C1", "#0038FF"];
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Retrieves the current user from localStorage.
 * @returns {Object|null} - Parsed user object or null.
 */
function getCurrentUser() {
  let stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
}

window.getCurrentUser = getCurrentUser;

/**
 * Clears the entire task creation form and resets UI components.
 */
function clearForm() {
  clearTextFields();
  resetCategorySelection();
  resetPriorityButtons();
  clearAssignedUsers();
  clearSubtaskList();
  resetAssignedDropdown();
  setDefaultPriority();
}

/**
 * Clears the input values for the title, description, and due date fields.
 */
function clearTextFields() {
  ["title", "desc", "due-date"].forEach(id => {
    let input = document.getElementById(id);
    if (input) input.value = "";
  });
}

/**
 * Resets the task category selection to its default placeholder.
 */
function resetCategorySelection() {
  let category = document.getElementById("selected-category");
  if (category) {
    category.textContent = "Select task category";
    category.classList.add("category-placeholder");
  }
}

/**
 * Resets all priority buttons to their default (inactive) state and icons.
 */
function resetPriorityButtons() {
  document.querySelectorAll(".priority-btn").forEach(btn => {
    btn.classList.remove("active-urgent", "active-medium", "active-low");
    let img = btn.querySelector("img");
    if (btn.classList.contains("urgent")) img.src = "svg/urgent.svg";
    if (btn.classList.contains("medium")) img.src = "svg/medium.svg";
    if (btn.classList.contains("low")) img.src = "svg/low.svg";
  });
}

/**
 * Unchecks all assigned user checkboxes and clears the avatar display.
 */
function clearAssignedUsers() {
  document.querySelectorAll(".assigned-checkbox").forEach(box => {
    box.checked = false;
    box.closest(".assigned-row")?.classList.remove("active");
  });
  document.getElementById("selected-avatars").innerHTML = "";
}

/**
 * Clears the list of subtasks and resets the subtasks display container.
 */
function clearSubtaskList() {
  window.subtasks = [];
  document.getElementById("subtask-list").innerHTML = "";
}

/**
 * Resets the assigned user dropdown to its initial closed state and clears the search field.
 */
function resetAssignedDropdown() {
  document.getElementById("assigned-search").value = "";
  document.querySelector(".assigned-dropdown")?.classList.remove("open");
  document.getElementById("assigned-list")?.classList.add("d-none");
}

/**
 * Activates the medium priority button by default and sets its icon to the highlighted version.
 */
function setDefaultPriority() {
  let mediumBtn = document.querySelector(".priority-btn.medium");
  if (mediumBtn) {
    mediumBtn.classList.add("active-medium");
    let img = mediumBtn.querySelector("img");
    if (img) img.src = "svg/mediumwhite.svg";
  }
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
 * Generates HTML for a user row in the assign dropdown.
 * @param {string} name - User name.
 * @param {boolean} [isCurrent=false] - Whether it's the current user.
 * @returns {string} - HTML string.
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
 * Returns HTML for a selected user avatar.
 * @param {string} name - User name.
 * @returns {string} - HTML string.
 */
function avatarTemplate(name) {
  let initials = getInitials(name);
  let color = getColorFromName(name);
  return `<div class="selected-avatar" style="background-color: ${color}">${initials}</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  let dropdown = document.getElementById("assigned-select");
});

document.addEventListener("click", function (event) {
  let dropdown = document.querySelector(".assigned-dropdown");
  let assignedList = document.getElementById("assigned-list");
  if (dropdown && !dropdown.contains(event.target)) {
    dropdown.classList.remove("open");
    assignedList.classList.add("d-none");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  let dueDateInput = document.getElementById("due-date");
  if (dueDateInput) {
    let today = new Date().toISOString().split("T")[0];
    dueDateInput.setAttribute("min", today);
  }
});

/**
 * Toggles visibility of the task category dropdown.
 * @param {MouseEvent} event - Click event.
 */
function toggleCategoryDropdown(event) {
  event.stopPropagation();
  let dropdown = document.getElementById("category-dropdown");
  let options = document.getElementById("category-options");
  let isOpen = !options.classList.contains("d-none");
  if (isOpen) {
    options.classList.add("d-none");
  } else {
    options.classList.remove("d-none");
  }
}

document.addEventListener("click", function (event) {
  let dropdown = document.getElementById("category-dropdown");
  if (dropdown && !dropdown.contains(event.target)) {
    document.getElementById("category-options")?.classList.add("d-none");
  }
});

/**
 * Sets the selected category in the dropdown UI.
 * @param {string} category - The chosen category.
 */
function selectCategory(category) {
  let selected = document.getElementById("selected-category");
  selected.textContent = category;
  selected.classList.remove("category-placeholder");
  document.getElementById("category-options").classList.add("d-none");
}

window.selectCategory = selectCategory;

document.addEventListener("DOMContentLoaded", () => {
  let dueDateInput = document.getElementById("due-date");
  if (dueDateInput) {
    let today = new Date().toISOString().split("T")[0];
    dueDateInput.setAttribute("min", today);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  let categorySelect = document.querySelector(".category-select");
  if (categorySelect) {
    categorySelect.addEventListener("click", (event) => {
      categorySelect.classList.add("input-focus");
      toggleCategoryDropdown(event);
    });

    document.addEventListener("click", (event) => {
      if (!categorySelect.contains(event.target)) {
        categorySelect.classList.remove("input-focus");
        let options = document.getElementById("category-options");
        if (options) options.classList.add("d-none");
      }
    });
  }
});
