function createTaskFromForm() {
    const isValid = validateRequiredFields();
    if (!isValid) return; // Stoppt, wenn Pflichtfelder nicht erfüllt
  
    // ... hier geht's weiter mit Task-Erstellung
    console.log("Alle Felder korrekt – Task wird erstellt");
  }
  function validateRequiredFields() {
    const title = document.getElementById("title").value.trim();
    const date = document.getElementById("due-date").value.trim();
    const category = document.getElementById("category").value;
  
    let valid = true;
  
    // Title validieren
    const titleError = document.getElementById("title-error");
    if (title === "") {
      titleError.classList.remove("d-none");
      setTimeout(() => titleError.classList.add("d-none"), 3000);
      valid = false;
    } else {
      titleError.classList.add("d-none");
    }
  
    // Due date validieren
    const dateError = document.getElementById("date-error");
    if (date === "") {
      dateError.classList.remove("d-none");
      setTimeout(() => dateError.classList.add("d-none"), 3000);
      valid = false;
    } else {
      dateError.classList.add("d-none");
    }
  
    // Kategorie validieren
    const categoryError = document.getElementById("category-error");
    if (!category) {
      categoryError.classList.remove("d-none");
      setTimeout(() => categoryError.classList.add("d-none"), 3000);
      valid = false;
    } else {
      categoryError.classList.add("d-none");
    }
  
    return valid;
  }
  
  
  window.addEventListener("resize", handleResponsiveNote);
  window.addEventListener("DOMContentLoaded", handleResponsiveNote);
  
  document.addEventListener("click", closeMenuOnOutsideClick);
  
  
  // Globale Registrierung
  window.toggleMenu = toggleMenu;
  window.toggleAssignedDropdown = toggleAssignedDropdown;
  window.assignedToInput = assignedToInput;
  window.toggleCheckbox = toggleCheckbox;
  window.openAssignedDropdown = openAssignedDropdown;
  window.filterAssignedList = filterAssignedList;
  window.createTaskFromForm = createTaskFromForm;
  window.validateRequiredFields = validateRequiredFields;
  