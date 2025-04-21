const priorityButtons = document.querySelectorAll('.priority-btn');
let activeButton = null;

priorityButtons.forEach(button => {
  button.addEventListener('click', () => {
    const isActive = button.classList.contains('active-urgent') ||
                     button.classList.contains('active-medium') ||
                     button.classList.contains('active-low');

    // Entferne alle aktiven Styles
    priorityButtons.forEach(btn => {
      btn.classList.remove('active-urgent', 'active-medium', 'active-low');
    });

    // Wenn der Button nicht aktiv war → aktiviere ihn
    if (!isActive) {
      if (button.classList.contains('urgent')) {
        button.classList.add('active-urgent');
      } else if (button.classList.contains('medium')) {
        button.classList.add('active-medium');
      } else if (button.classList.contains('low')) {
        button.classList.add('active-low');
      }
    }
  });
});