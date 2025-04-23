// Öffnet das Add-Task Modal
window.openAddTaskModal = function () {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
      modal.classList.remove('d-none');
      document.body.classList.add('modal-open');
    }
  };
  
  // Schließt das Add-Task Modal
  window.closeAddTaskModal = function () {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
      modal.classList.add('d-none');
      document.body.classList.remove('modal-open');
    }
  };
  
  // Button-Klicks registrieren
  document.addEventListener('DOMContentLoaded', () => {
    // Großer Button oben
    const mainAddBtn = document.querySelector('.add-task-btn');
    if (mainAddBtn) {
      mainAddBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openAddTaskModal();
      });
    }
  
    // Kleine Plus-Buttons in den Spalten
    const iconButtons = document.querySelectorAll('.icon-btn');
    iconButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        openAddTaskModal();
      });
    });
  });
  
  // Modal schließen beim Klick außerhalb
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('addTaskModal');
    const content = modal?.querySelector('.modal-content');
    const isVisible = modal && !modal.classList.contains('d-none');
  
    if (
      isVisible &&
      !content.contains(e.target) &&
      !e.target.closest('.add-task-btn') &&
      !e.target.closest('.icon-btn')
    ) {
      closeAddTaskModal();
    }
  });
  
  // Modal schließen per ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAddTaskModal();
    }
  });
  