async function login(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Bitte fülle beide Felder aus.");
        return;
    }

    try {
        const response = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/users.json");
        const data = await response.json();

        let userFound = false;

        for (const key in data) {
            if (data[key].email === email && data[key].password === password) {
                userFound = true;
                break;
            }
        }

        if (userFound) {
            // Beispiel: user-Objekt mit Email + Name (falls du Namen gespeichert hast)
            const loggedInUser = {
                email: data[key].email,
                name: data[key].name || ""  // falls nicht vorhanden, leer
            };
        
            // Im localStorage speichern
            localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        
            alert("Login erfolgreich!");
            window.location.href = "summary.html";
        }
        
        } else {
            alert("E-Mail oder Passwort ist falsch.");
        }

    } catch (error) {
        console.error("Fehler beim Login:", error);
        alert("Es gab ein Problem beim Verbinden mit dem Server.");
    }
}
