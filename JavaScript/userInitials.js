// Funktion zum Generieren der Initialen
export function getInitialsFromName(fullName) {
    if (!fullName || !fullName.includes(' ')) {
        return 'G'; // Fallback für Gäste oder unvollständige Namen
    }
    
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const firstInitial = firstName.charAt(0);
    const lastInitial = lastName.charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
}

// Funktion zum Aktualisieren der Initialen im UI
export function updateUserInitials() {
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        if (!userData.name) {
            return;
        }
        
        const initials = getInitialsFromName(userData.name);
        const initialElements = document.querySelectorAll('.user-initial-small');
        
        initialElements.forEach(element => {
            element.textContent = initials;
            element.style.color = '#29ABE2';
            element.style.display = 'flex';
            element.style.justifyContent = 'center';
            element.style.alignItems = 'center';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        updateUserInitials();
        updateGreetingMessage(); // hier aufrufen
    }, 100);
});

window.addEventListener('load', () => {
    updateUserInitials();
    updateGreetingMessage(); // hier ebenfalls
});

// Exportiere eine Funktion zum manuellen Aktualisieren
export function initializeUserInitials() {
    updateUserInitials();
} 