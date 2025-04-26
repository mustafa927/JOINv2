document.addEventListener('DOMContentLoaded', () => {
    // Array mit allen Feldern und zugehörigen Icons
    const fields = [
        {
            input: document.getElementById('password'),
            toggle: document.getElementById('togglePassword'),
            lock: document.getElementById('lockIconPassword')
        },
        {
            input: document.getElementById('confirmPassword'),
            toggle: document.getElementById('toggleConfirmPassword'),
            lock: document.getElementById('lockIconConfirm')
        }
    ];

    // Die Pfade zu den Icons
    const lookOn = 'svg/visibility_off.svg';      // Auge offen
    const lookOff = 'svg/visibility.svg'; // Auge durchgestrichen

    fields.forEach(field => {
        if (field.input && field.toggle && field.lock) {
            // Zeige/verstecke Icons je nach Inhalt
            field.input.addEventListener('input', function() {
                if (this.value.length > 0) {
                    field.toggle.style.display = 'block';
                    field.lock.style.visibility = 'hidden';
                } else {
                    field.toggle.style.display = 'none';
                    field.lock.style.visibility = 'visible';
                    field.input.type = 'password'; // falls Auge aktiv war
                    field.toggle.src = lookOn;     // Icon zurücksetzen
                }
            });

            // Passwort anzeigen/verstecken beim Klick aufs Icon
            field.toggle.addEventListener('click', function() {
                if (field.input.type === 'password') {
                    field.input.type = 'text';
                    field.toggle.src = lookOff;
                } else {
                    field.input.type = 'password';
                    field.toggle.src = lookOn;
                }
            });

            // Initial-Check beim Laden (z.B. Autofill)
            if (field.input.value.length > 0) {
                field.toggle.style.display = 'block';
                field.lock.style.visibility = 'hidden';
            } else {
                field.toggle.style.display = 'none';
                field.lock.style.visibility = 'visible';
                field.toggle.src = lookOn;
            }
        }
    });
});