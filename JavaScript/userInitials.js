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
            element.style.backgroundColor = '#29ABE2';
            element.style.color = 'white';
            element.style.display = 'flex';
            element.style.justifyContent = 'center';
            element.style.alignItems = 'center';
        });
    }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateUserInitials, 100);
});

// Zusätzlich beim vollständigen Laden der Seite
window.addEventListener('load', () => {
    updateUserInitials();
});

// Exportiere eine Funktion zum manuellen Aktualisieren
export function initializeUserInitials() {
    updateUserInitials();
} 