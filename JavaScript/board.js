import { auth } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let draggedElement;

/**
 * starts dragging element
 * @param {string} event 
 */

window.startDragging = function(event) {
  draggedElement = event.target;
}

/**
 * allows to drop Element 
 * @param {string} event 
 */

window.allowDrop = function(event) {
  event.preventDefault();
}

/**
 * Handles the drop event during a drag-and-drop operation on a task card.
 * Moves the dragged task to the dropzone, updates the UI accordingly,
 * and sends the new status to the database.
 *
 * @param {DragEvent} event - The drag-and-drop event triggered when a task card is dropped.
 * 
 */


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


/**
 * Moves a task card element into a given dropzone.
 * If the dropzone does not yet contain a `.card-bucket` container,
 * it creates one and appends the card into it.
 *
 * @param {HTMLElement} cardElement - The task card element being moved.
 * @param {HTMLElement} dropzone - The target container where the card should be dropped.
 */

function moveTaskCardToDropzone(cardElement, dropzone) {
  let bucket = dropzone.querySelector('.card-bucket');

  if (!bucket) {
    bucket = document.createElement('div');
    bucket.classList.add('card-bucket');
    dropzone.appendChild(bucket);
  }

  bucket.appendChild(cardElement);
}


/**
 * checks if the sections are empty and toggles D:none on the div NO Tasks To Do
 */


function hideNoTasksMessage(dropzone) {
  const noTasksMessage = dropzone.querySelector('.no-tasks');
  if (noTasksMessage) {
    noTasksMessage.classList.add('d-none');
  }
}

/**
 * 
 * builds the correct Task Id 
 * 
 * @param {string} cardId 
 * @returns 
 */

function extractTaskId(cardId) {
  return cardId.replace("task-", "");
}




// function checkEmptySections() {
//     document.querySelectorAll('.progress-section').forEach(section => {
//       const cards = section.querySelectorAll('.card');
//       const noTasks = section.querySelector('.no-tasks');
      
//       if (cards.length === 0 && noTasks) {
//         noTasks.classList.remove('d-none');
//       } else if (cards.length > 0 && noTasks) {
//         noTasks.classList.add('d-none');
//       }
//     });
// }

/**
 * returns in wich dropzone the element is currently in
 * @param {string} dropzone 
 * @returns 
 */
function getStatusFromDropzone(dropzone) {
  const title = dropzone.querySelector(".to-do-header p")?.innerText.toLowerCase();

  if (title.includes("to do")) return "To-Do";
  if (title.includes("in progress")) return "In Progress";
  if (title.includes("await feedback")) return "Await Feedback";
  if (title.includes("done")) return "Done";

  return null;
}


/**
 * Updates current Status of task in databank
 * @param {string} taskId 
 * @param {string} newStatus 
 */

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


/**
 * toggles the dropdown menu
 */

window.toggleMenu = function() {
    const menu = document.getElementById("dropdownMenu");
    if (menu) {
        menu.classList.toggle("show");
    }
}

/**
 * Toggles the visibility of the user dropdown menu.
 * Adds or removes the "show" class on the element with ID "userDropdown".
 *

 */

window.toggleDropdown = function() {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

/**
 * Global click event listener that closes the dropdown menu
 * if a click occurs outside the profile wrapper element.
 *
 * @param {MouseEvent} e - The click event object.
 * 
 */

document.addEventListener("click", function (e) {
    const profile = document.querySelector(".profile-wrapper");
    const menu = document.getElementById("dropdownMenu");
    if (profile && menu && !profile.contains(e.target)) {
        menu.classList.remove("show");
    }
});


/**
 * Logout for current user
 */

async function handleLogout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        window.location.href = 'Index.html';
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

/**
 * Sets up the logout button behavior after the DOM has fully loaded.
 * Attaches a click event to the logout link inside the dropdown menu,
 * preventing default navigation and triggering the logout logic.
 *
 */

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('#dropdownMenu a[href="index.html"]');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});



