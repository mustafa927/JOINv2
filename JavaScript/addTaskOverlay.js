


function clearForm() {
  resetInputs();
  hideErrors();
  removePriorityClasses();
}


function resetInputs() {
  document.getElementById('title').value = '';
  document.getElementById('desc').value = '';
  document.getElementById('due-date').value = '';
  document.getElementById('assigned').selectedIndex = 0;
  document.getElementById('category').selectedIndex = 0;

  const subtask = document.querySelector('.subtask-input');
  if (subtask) subtask.value = '';
}


function hideErrors() {
  ['title-error', 'category-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('d-none');
  });
}

