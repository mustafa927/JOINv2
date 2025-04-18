let draggedElement;

function startDragging(event) {
  draggedElement = event.target;
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
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