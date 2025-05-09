
export function getInitialsFromName(fullName) {
    if (!fullName || !fullName.includes(' ')) {
        return 'G'; 
    }
    
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const firstInitial = firstName.charAt(0);
    const lastInitial = lastName.charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
}


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
    }, 100);
});

window.addEventListener('load', () => {
    updateUserInitials();
});


export function initializeUserInitials() {
    updateUserInitials();
} 