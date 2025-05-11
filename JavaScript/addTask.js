import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let allUsers = [];
let priorityButtons = document.querySelectorAll(".priority-btn");
let activeButton = null;
let subtasks = [];

function addSubtask() {
  const input = document.querySelector('.subtask-input');
  const title = input.value.trim();
  if (!title) return;

  const subtaskId = `sub${subtasks.length + 1}`;
  subtasks.push({ id: subtaskId, title, done: false });

  renderSubtaskList(subtaskId, title);
  input.value = ""; // 🧼 Feld leeren
}

function renderSubtaskList(id, title) {
  const li = document.createElement('li');
  li.className = 'subtask-item';
  li.id = `subtask-${id}`;
  li.innerHTML = `
    <span class="subtask-title">${title}</span>
    <div class="subtask-actions">
      <img src="svg/edit-black.svg" class="subtask-icon" onclick="editSubtask('${id}')">
      <span class="divider"></span>
      <img src="svg/delete.svg" class="subtask-icon" onclick="deleteSubtask('${id}')">
    </div>
  `;
  document.getElementById('subtask-list').appendChild(li);
}

function editSubtask(id) {
  const li = document.getElementById(`subtask-${id}`);
  const title = li.querySelector('.subtask-title').textContent;
  li.innerHTML = `
  <input type="text" class="edit-subtask-input" value="${title}" />
<div class="subtask-actions">
  <img src="svg/delete.svg" class="subtask-icon" onclick="deleteSubtask('${id}')">
  <span class="divider"></span>
  <span class="subtask-icon" onclick="saveSubtask('${id}')">✔</span>
</div>

  `;
}

function saveSubtask(id) {
  const li = document.getElementById(`subtask-${id}`);
  const newTitle = li.querySelector('.edit-subtask-input').value.trim();
  if (!newTitle) return;

  li.innerHTML = `
    <span class="subtask-title">${newTitle}</span>
    <div class="subtask-actions">
      <img src="svg/edit-black.svg" class="subtask-icon" onclick="editSubtask('${id}')">
      <span class="divider"></span>
      <img src="svg/delete.svg" class="subtask-icon" onclick="deleteSubtask('${id}')">
    </div>
  `;
}

function deleteSubtask(id) {
  const li = document.getElementById(`subtask-${id}`);
  li.remove();
}


function toggleSubtaskDone(id) {
  const sub = subtasks.find(s => s.id === id);
  if (sub) sub.done = !sub.done;
}

function handlePriorityClick(button) {
  let isActive = button.classList.contains("active-urgent") ||
                 button.classList.contains("active-medium") ||
                 button.classList.contains("active-low");
  priorityButtons.forEach(btn => {
    btn.classList.remove("active-urgent", "active-medium", "active-low");
  });
  if (!isActive) button.classList.add(getActiveClass(button));
}

function getActiveClass(button) {
  if (button.classList.contains("urgent")) return "active-urgent";
  if (button.classList.contains("medium")) return "active-medium";
  if (button.classList.contains("low")) return "active-low";
  return "";
}

function setupPriorityButtons() {
  priorityButtons.forEach(btn => btn.addEventListener("click", () => handlePriorityClick(btn)));
}

function toggleMenu() {
  let menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.toggle("show");
}

function closeMenuOnOutsideClick(e) {
  let profile = document.querySelector(".profile-wrapper");
  let menu = document.getElementById("dropdownMenu");
  if (profile && menu && !profile.contains(e.target)) menu.classList.remove("show");
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
  let logoutBtn = document.querySelector('#dropdownMenu a[href="index.html"]');
  if (logoutBtn) logoutBtn.addEventListener("click", e => {
    e.preventDefault();
    handleLogout();
  });
}

async function assignedToInput() {
  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  let data = await res.json();
  allUsers = Object.entries(data).map(([id, user]) => ({ id, ...user }));
  renderUserList();
}

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

function toggleAssignedDropdown(e) {
  let dropdown = document.querySelector(".assigned-dropdown");
  let options = document.getElementById("assigned-list");
  let isOpen = dropdown.classList.contains("open");
  dropdown.classList.toggle("open", !isOpen);
  options.classList.toggle("d-none", isOpen);
  e.stopPropagation();
}

function toggleCheckbox(e) {
  if (e.target.tagName !== "INPUT") {
    let checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = !checkbox.checked;
  }
  e.currentTarget.classList.toggle("active");
  updateSelectedAvatars();
}

function updateSelectedAvatars() {
  let container = document.getElementById("selected-avatars");
  container.innerHTML = "";
  document.querySelectorAll(".assigned-checkbox:checked").forEach(box => {
    container.innerHTML += avatarTemplate(box.dataset.name);
  });
}

function openAssignedDropdown(e) {
  let dropdown = document.querySelector(".assigned-dropdown");
  let options = document.getElementById("assigned-list");
  dropdown.classList.add("open");
  options.classList.remove("d-none");
  e.stopPropagation();
}

function filterAssignedList() {
  let value = document.getElementById("assigned-search").value;
  renderUserList(value);
}

function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  let colors = ["#FF7A00", "#9327FF", "#6E52FF", "#FC71FF", "#00BEE8", "#1FD7C1", "#0038FF"];
  return colors[Math.abs(hash) % colors.length];
}

function getCurrentUser() {
  let stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
}

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

function avatarTemplate(name) {
  let initials = getInitials(name);
  let color = getColorFromName(name);
  return `<div class="selected-avatar" style="background-color: ${color}">${initials}</div>`;
}
