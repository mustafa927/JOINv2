// In deiner bestehenden JavaScript-Datei oder im <script>-Tag
// document
//   .querySelector(".signup-button")
//   .addEventListener("click", function (e) {
//     e.preventDefault();
//     window.location.href = "signUp.html"; // oder per AJAX laden
//   });

// wenn in allen input feldern input + checkbox + signup , dann upload zu firebase

// firebase link

let url = "https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/users.json";

    async function signup(event) {
      event.preventDefault();

      let name = document.getElementById("name").value.trim();
      let email = document.getElementById("email").value.trim();
      let password = document.getElementById("password").value;
      let confirmPassword = document.getElementById("confirm-password").value;
      let accepted = document.getElementById("privacy-policy").checked;

      if (!name || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
      }

      if (!accepted) {
        alert("You must accept the privacy policy.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      let user = { name, email, password };

      try {
        let response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });

        let result = await response.json();
        console.log("User saved with ID:", result.name);

        alert("Sign up successful!");
        window.location.href = "index.html";
      } catch (err) {
        console.error("Signup failed:", err);
        alert("Signup failed. Please try again.");
      }
    }