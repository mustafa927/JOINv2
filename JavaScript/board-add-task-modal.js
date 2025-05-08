function openAddTaskModal(status = "To-Do") {
  const modal = document.getElementById('addTaskModal');
  if (modal) {
    modal.classList.remove('d-none');
    document.body.classList.add('modal-open');

    // Status im globalen Fenster speichern, damit das Modal (iframe) ihn abrufen kann
    window.currentTaskStatus = status;
  }
}



function closeAddTaskModal() {
  const modal = document.getElementById('addTaskModal');
  if (modal) {
    modal.classList.add('d-none');
    document.body.classList.remove('modal-open');
  }
}


function registerModalOpeners() {
  document.querySelectorAll('.add-task-btn, .icon-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();

      // Standard-Status
      let status = "To-Do";

      // Suche nach dem Eltern-Container, der den Status im DOM sichtbar macht
      const section = btn.closest('.progress-section');
      if (section) {
        const headerText = section.querySelector('.to-do-header p')?.textContent.trim().toLowerCase();

        if (headerText === "in progress") status = "In Progress";
        else if (headerText === "await feedback") status = "Await Feedback";
        else if (headerText === "done") status = "Done";
        else if (headerText === "to do") status = "To-Do";
      }

      // Prüfe Bildschirmbreite
      if (window.innerWidth < 768) {
        // Mobile: Weiterleitung zur AddTask-Seite mit Status-Parameter
        window.location.href = `addTask.html?status=${encodeURIComponent(status)}`;
      } else {
        // Desktop: Modal öffnen
        openAddTaskModal(status);
      }
    });
  });
}



function registerModalCloseOnClick() {
  document.addEventListener('click', e => {
    const modal = document.getElementById('addTaskModal');
    const content = modal?.querySelector('.modal-content');
    const isVisible = modal && !modal.classList.contains('d-none');

    if (isVisible &&
        !content.contains(e.target) &&
        !e.target.closest('.add-task-btn') &&
        !e.target.closest('.icon-btn')) {
      closeAddTaskModal();
    }
  });
}


function registerModalCloseOnEscape() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAddTaskModal();
  });
}


document.addEventListener('DOMContentLoaded', () => {
  registerModalOpeners();
  registerModalCloseOnClick();
  registerModalCloseOnEscape();
});


window.openAddTaskModal = openAddTaskModal;
window.closeAddTaskModal = closeAddTaskModal;
