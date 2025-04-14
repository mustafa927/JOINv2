document.addEventListener("DOMContentLoaded", function () {
    const toggleIcons = document.querySelectorAll(".toggle-password");
    const passwordInput = document.querySelector("#password");
    const confirmPasswordInput = document.querySelector("#confirm-password");
    const errorMessage = document.querySelector("#password-error");
    const form = document.querySelector("form");
  
    let confirmTouched = false; // Nur anzeigen, wenn confirm field benutzt wurde
  
    // Toggle-Icon Logik (Schloss/Auge)
    toggleIcons.forEach(icon => {
      const input = document.querySelector(icon.getAttribute("toggle"));
  
      icon.classList.remove("fa-eye", "fa-eye-slash");
      icon.classList.add("fa-lock");
  
      input.addEventListener("focus", () => {
        if (input.type === "password") {
          icon.classList.remove("fa-lock");
          icon.classList.add("fa-eye-slash");
        }
      });
  
      input.addEventListener("blur", () => {
        setTimeout(() => {
          if (input.type === "password") {
            icon.classList.remove("fa-eye", "fa-eye-slash");
            icon.classList.add("fa-lock");
          }
        }, 150);
      });
  
      icon.addEventListener("click", function () {
        if (!icon.classList.contains("fa-lock")) {
          const isPassword = input.type === "password";
          input.type = isPassword ? "text" : "password";
          icon.classList.toggle("fa-eye");
          icon.classList.toggle("fa-eye-slash");
        }
      });
    });
  
    // Passwort-Abgleich prüfen
    function checkPasswordsMatch() {
      const match = passwordInput.value === confirmPasswordInput.value;
  
      if (!match && confirmTouched && confirmPasswordInput.value !== "") {
        errorMessage.style.display = "block";
        confirmPasswordInput.classList.add("input-error");
      } else {
        errorMessage.style.display = "none";
        confirmPasswordInput.classList.remove("input-error");
      }
  
      return match;
    }
  
    // Fehleranzeige erst aktivieren, wenn Feld berührt wurde
    confirmPasswordInput.addEventListener("input", function () {
      confirmTouched = true;
      checkPasswordsMatch();
    });
  
    passwordInput.addEventListener("input", checkPasswordsMatch);
  
    form.addEventListener("submit", function (e) {
      if (!checkPasswordsMatch()) {
        e.preventDefault();
      }
    });
  });
  