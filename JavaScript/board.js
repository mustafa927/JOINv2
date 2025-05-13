import { auth } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let draggedElement;

window.startDragging = function(event) {
  draggedElement = event.target;
}

window.allowDrop = function(event) {
  event.preventDefault();
}

window.drop = async function handleDrop(event) {
  event.preventDefault();
  const dropzone = event.currentTarget;
  if (!draggedElement || !dropzone.classList.contains('dropzone')) return;
  moveTaskCardToDropzone(draggedElement, dropzone);
  hideNoTasksMessage(dropzone);
  checkEmptySections();

  const taskId = extractTaskId(draggedElement.id);
  const newStatus = getStatusFromDropzone(dropzone);
  if (taskId && newStatus) {
    await updateTaskStatus(taskId, newStatus);
  }
};

function moveTaskCardToDropzone(cardElement, dropzone) {
  let bucket = dropzone.querySelector('.card-bucket');

  if (!bucket) {
    bucket = document.createElement('div');
    bucket.classList.add('card-bucket');
    dropzone.appendChild(bucket);
  }

  bucket.appendChild(cardElement);
}


function hideNoTasksMessage(dropzone) {
  const noTasksMessage = dropzone.querySelector('.no-tasks');
  if (noTasksMessage) {
    noTasksMessage.classList.add('d-none');
  }
}

function extractTaskId(cardId) {
  return cardId.replace("task-", "");
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



function getStatusFromDropzone(dropzone) {
  const title = dropzone.querySelector(".to-do-header p")?.innerText.toLowerCase();

  if (title.includes("to do")) return "To-Do";
  if (title.includes("in progress")) return "In Progress";
  if (title.includes("await feedback")) return "Await Feedback";
  if (title.includes("done")) return "Done";

  return null;
}

async function updateTaskStatus(taskId, newStatus) {
  try {
    await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/Tasks/${taskId}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ Status: newStatus })
    });
  } catch (error) {
    console.error("Fehler beim Status-Update:", error);
  }
}




window.toggleMenu = function() {
    const menu = document.getElementById("dropdownMenu");
    if (menu) {
        menu.classList.toggle("show");
    }
}

window.toggleDropdown = function() {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

document.addEventListener("click", function (e) {
    const profile = document.querySelector(".profile-wrapper");
    const menu = document.getElementById("dropdownMenu");
    if (profile && menu && !profile.contains(e.target)) {
        menu.classList.remove("show");
    }
});

async function handleLogout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        window.location.href = 'Index.html';
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('#dropdownMenu a[href="index.html"]');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});



