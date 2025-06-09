/**
 * Validates the contact form fields: name, email, and phone.
 * @returns {boolean}
 */
function validateContactForm() {
  const nameInput = document.getElementById("inputName");
  const emailInput = document.getElementById("inputEmail");
  const phoneInput = document.getElementById("inputPhone");

  resetValidation([nameInput, emailInput, phoneInput]);

  const validName = validateInput(nameInput, /^[A-Za-z\s]+$/, "Please enter a valid name.");
  const validEmail = validateInput(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email.");
  const validPhone = validateInput(phoneInput, /^\d{7,}$/, "Phone number must be at least 7 digits and numeric.");

  return validName && validEmail && validPhone;
}

/**
 * Resets validation state on input fields.
 * @param {HTMLElement[]} inputs
 */
function resetValidation(inputs) {
  inputs.forEach(input => {
    input.style.border = "";
    const errorElem = input.parentNode.querySelector(".error-message");
    if (errorElem) errorElem.textContent = "";
  });
}

/**
 * Validates a single input against a regex pattern.
 * @param {HTMLElement} input
 * @param {RegExp} pattern
 * @param {string} message
 * @returns {boolean}
 */
function validateInput(input, pattern, message) {
  const value = input.value.trim();
  if (!pattern.test(value)) {
    setError(input, message);
    return false;
  }
  return true;
}

/**
 * Displays a validation error on an input field.
 * @param {HTMLElement} inputElement
 * @param {string} message
 */
function setError(inputElement, message) {
  inputElement.style.border = "1px solid #ff8190";
  const errorElem = inputElement.parentNode.querySelector(".error-message");
  if (errorElem) {
    errorElem.textContent = message;
    setTimeout(() => {
      inputElement.style.border = "";
      errorElem.textContent = "";
    }, 3000);
  }
}

/**
 * Saves a new contact to Firebase.
 * @async
 * @returns {Promise<void>}
 */
async function saveContact() {
  const submitBtn = document.getElementById("createContactBtn");

  if (!validateContactForm()) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = `Creating...`;

  const { name, email, phone } = getInputValues();
  const newContact = { name, email, phone };

  try {
    await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json", {
      method: "POST",
      body: JSON.stringify(newContact),
      headers: { "Content-Type": "application/json" }
    });

    await fetchData();
    closeOverlay();
    showSuccessMessage();
  } catch (error) {
    console.error("❌ Error saving contact:", error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `Create contact <span>&check;</span>`;
  }
}

/**
 * Collects values from the input fields.
 * @returns {{name: string, email: string, phone: string}}
 */
function getInputValues() {
  return {
    name: document.getElementById("inputName").value.trim(),
    email: document.getElementById("inputEmail").value.trim(),
    phone: document.getElementById("inputPhone").value.trim()
  };
}
