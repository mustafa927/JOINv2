// Die Funktion für das Dropdown-Menü
function toggleDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.user-initial-small')) {
        var dropdowns = document.getElementsByClassName("dropdown-menu-small");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Event Listener hinzufügen, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    const userInitialButton = document.querySelector('.user-initial-small');
    if (userInitialButton) {
        userInitialButton.addEventListener('click', toggleDropdown);
    }
});

// Die Funktion global verfügbar machen
window.toggleDropdown = toggleDropdown;
