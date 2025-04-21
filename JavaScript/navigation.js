document.addEventListener('DOMContentLoaded', function() {
    initHelpNavigation();
});

function initHelpNavigation() {
    const helpIcon = document.getElementById('helpIcon');
    if (helpIcon) {
        helpIcon.addEventListener('click', navigateToHelp);
    }
}

function navigateToHelp() {
    window.location.href = 'help.html';
}

function toggleMenu() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('show');
    }
}