function openAddTaskModal() {
  const modal = document.getElementById('addTaskModal');
  if (modal) {
    modal.classList.remove('d-none');
    document.body.classList.add('modal-open');
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
      openAddTaskModal();
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
