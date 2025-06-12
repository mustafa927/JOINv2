/**
 * Toggles the visibility of the user dropdown menu.
 */
function toggleDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

/**
 * Closes the dropdown menu if the user clicks outside of the trigger element.
 * 
 * @param {MouseEvent} event - The global click event.
 */
window.onclick = function(event) {
    if (!event.target.matches('.user-initial-small')) {
        let dropdowns = document.getElementsByClassName("dropdown-menu-small");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
};

/**
 * Registers the dropdown toggle handler on page load.
 */
document.addEventListener('DOMContentLoaded', () => {
    let userInitialButton = document.querySelector('.user-initial-small');
    if (userInitialButton) {
        userInitialButton.addEventListener('click', toggleDropdown);
    }
});

/**
 * Makes the toggleDropdown function globally accessible.
 */
window.toggleDropdown = toggleDropdown;
