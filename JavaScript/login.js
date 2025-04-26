import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { updateUserInitials } from './userInitials.js';

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    // Reset all error messages
    hideError('email-error');
    hideError('password-error');
    hideError('general-error');
    
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    // Enhanced input validation
    if (!email || !password) {
        showError('general-error', 'Please enter your email and password.');
        return;
    }

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        showError('email-error', 'Please enter a valid email address.');
        return;
    }

    // Password validation
    if (password.length < 6) {
        showError('password-error', 'The password must be at least 6 characters long.');
        return;
    }

    const loginButton = document.querySelector('.btn-primary');
    if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';
    }

    try {
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data from Firestore:', userData); // Debug log

            // Update lastLogin timestamp
            await setDoc(userDocRef, {
                ...userData,
                lastLogin: new Date().toISOString()
            }, { merge: true });

            // Store user session
            const userDataToStore = {
                uid: user.uid,
                ...userData
            };
            console.log('Storing user data:', userDataToStore); // Debug log
            localStorage.setItem('currentUser', JSON.stringify(userDataToStore));

            // Initialen aktualisieren
            updateUserInitials();

            // Redirect to summary page
            window.location.href = 'summary.html';
        } else {
            // Create basic user data
            const userData = {
                name: user.displayName || 'User',
                email: user.email,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                tasks: [],
                contacts: []
            };

            // Save user data to Firestore
            await setDoc(userDocRef, userData);

            // Store user session
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                ...userData
            }));

            // Initialen aktualisieren
            updateUserInitials();

            // Redirect to summary page
            window.location.href = 'summary.html';
        }
    } catch (error) {
        if (error.code === 'auth/invalid-credential') {
            showError('general-error', 'Invalid email or password. Please check your login details.');
        } else if (error.code === 'auth/user-not-found') {
            showError('email-error', 'No account found with this email address. Please register or check your email address.');
        } else if (error.code === 'auth/wrong-password') {
            showError('password-error', 'Wrong password. Please try again or reset your password.');
        } else if (error.code === 'auth/too-many-requests') {
            showError('general-error', 'Too many failed attempts. Please try again later or reset your password.');
        } else if (error.code === 'auth/network-request-failed') {
            showError('general-error', 'Network error. Please check your internet connection and try again.');
        } else {
            showError('general-error', 'An error occurred during login. Please try again later.');
        }
    } finally {
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = 'Log in';
        }
    }
}

// Handle guest login
function handleGuestLogin() {
    // Store guest session
    localStorage.setItem('currentUser', JSON.stringify({
        isGuest: true,
        name: 'Guest User'
    }));
    // Redirect to summary page
    window.location.href = 'summary.html';
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.querySelector('.btn-primary');
    const guestLoginButton = document.querySelector('.btn-secondary');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }
    
    if (guestLoginButton) {
        guestLoginButton.addEventListener('click', handleGuestLogin);
    }
});

async function handleLogout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        const initialElements = document.querySelectorAll('.user-initial-small');
        initialElements.forEach(element => {
            element.textContent = 'G';
        });
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error during logout:', error);
    }
} 