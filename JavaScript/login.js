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

function validateInputs(email, password) {
    if (!email || !password) return 'Please enter your email and password.';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'email';
    if (password.length < 6) return 'password';
    return '';
}

function setLoginButtonState(loading) {
    const loginButton = document.querySelector('.btn-primary');
    if (loginButton) {
        loginButton.disabled = loading;
        loginButton.textContent = loading ? 'Logging in...' : 'Log in';
    }
}

function storeUserSession(user, userData) {
    const userDataToStore = { uid: user.uid, ...userData };
    localStorage.setItem('currentUser', JSON.stringify(userDataToStore));
}

async function updateUserDoc(user, userData) {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, { ...userData, lastLogin: new Date().toISOString() }, { merge: true });
}

async function createUserDoc(user) {
    const userData = {
        name: user.displayName || 'User',
        email: user.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        tasks: [],
        contacts: []
    };
    await setDoc(doc(db, "users", user.uid), userData);
    return userData;
}

function handleLoginError(error) {
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
}

async function handleLogin(event) {
    event.preventDefault();
    hideError('email-error'); hideError('password-error'); hideError('general-error');
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const validation = validateInputs(email, password);
    if (validation === 'email') return showError('email-error', 'Please enter a valid email address.');
    if (validation === 'password') return showError('password-error', 'The password must be at least 6 characters long.');
    if (validation) return showError('general-error', validation);
    setLoginButtonState(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await processUserLogin(userCredential.user);
    } catch (error) {
        handleLoginError(error);
    } finally {
        setLoginButtonState(false);
    }
}

async function processUserLogin(user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    let userData;
    if (userDoc.exists()) {
        userData = userDoc.data();
        await updateUserDoc(user, userData);
    } else {
        userData = await createUserDoc(user);
    }
    storeUserSession(user, userData);
    updateUserInitials();
    
    // Set flag for new login to show greeting
    sessionStorage.setItem('newLogin', 'true');
    
    window.location.href = 'summary.html';
}

function handleGuestLogin() {
    localStorage.setItem('currentUser', JSON.stringify({ isGuest: true, name: 'Guest User' }));
    
    // Set flag for new login to show greeting
    sessionStorage.setItem('newLogin', 'true');
    
    window.location.href = 'summary.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.querySelector('.btn-primary');
    const guestLoginButton = document.querySelector('.btn-secondary');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (guestLoginButton) guestLoginButton.addEventListener('click', handleGuestLogin);
});

async function handleLogout() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        document.querySelectorAll('.user-initial-small').forEach(e => e.textContent = 'G');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error during logout:', error);
    }
} 
