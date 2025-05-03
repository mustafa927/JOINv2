import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { updateUserInitials } from './userInitials.js';

document.addEventListener('DOMContentLoaded', function() {
    const signupButton = document.getElementById('signupButton');
    if (signupButton) signupButton.addEventListener('click', handleSignUp);
    setupToggleIcons();
});

function resetErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.style.display = 'none');
    document.querySelectorAll('.input-field input').forEach(f => f.classList.remove('error'));
    document.getElementById('privacy-policy').classList.remove('error');
}

function getFormValues() {
    return {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        privacyPolicy: document.getElementById('privacy-policy').checked
    };
}

function validateName(name) {
    if (!name || !name.includes(' ')) {
        showError('name-error', 'Please enter your Fullname (with space)', 'name');
        return false;
    }
    return true;
}

function validateEmail(email) {
    if (!email) {
        showError('email-error', '', 'email');
        return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        showError('email-format-error', '', 'email');
        return false;
    }
    return true;
}

function validatePassword(password, confirmPassword) {
    let valid = true;
    if (!password) {
        showError('password-error', '', 'password');
        valid = false;
    }
    if (!confirmPassword) {
        showError('confirm-password-error', '', 'confirmPassword');
        valid = false;
    }
    if (password && confirmPassword && password !== confirmPassword) {
        showError('password-match-error', '', 'password');
        showError('password-match-error', '', 'confirmPassword');
        valid = false;
    }
    return valid;
}

function validatePrivacy(privacyPolicy) {
    if (!privacyPolicy) {
        showError('privacy-error', '', 'privacy-policy');
        return false;
    }
    return true;
}

function showError(id, msg, inputId) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'block';
        if (msg) el.textContent = msg;
        if (inputId) document.getElementById(inputId).classList.add('error');
    }
}

async function handleSignUp(e) {
    e.preventDefault();
    resetErrors();
    const { name, email, password, confirmPassword, privacyPolicy } = getFormValues();
    let hasError = false;
    if (!validateName(name)) hasError = true;
    if (!validateEmail(email)) hasError = true;
    if (!validatePassword(password, confirmPassword)) hasError = true;
    if (!validatePrivacy(privacyPolicy)) hasError = true;
    if (hasError) return;
    await trySignUp(name, email, password);
}

async function trySignUp(name, email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await saveUserData(userCredential.user, name, email);
        showSuccessAndRedirect();
    } catch (error) {
        handleSignUpError(error);
    }
}

async function saveUserData(user, name, email) {
    const userData = {
        name, email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        tasks: [], contacts: []
    };
    await setDoc(doc(db, "users", user.uid), userData);
    localStorage.setItem('currentUser', JSON.stringify({ uid: user.uid, ...userData }));
    updateUserInitials();
}

function showSuccessAndRedirect() {
    const msg = document.getElementById('success-message');
    if (msg) msg.style.display = 'block';
    setTimeout(() => window.location.href = 'index.html', 2000);
}

function handleSignUpError(error) {
    const el = document.getElementById('general-error');
    if (!el) return;
    let msg = '';
    switch (error.code) {
        case 'auth/email-already-in-use': msg = 'This email is already registered.'; break;
        case 'auth/invalid-email': msg = 'Please enter a valid email address.'; break;
        case 'auth/weak-password': msg = 'Password is too weak.'; break;
        default: msg = 'An error occurred during registration.';
    }
    el.textContent = msg;
    el.style.display = 'block';
}

function setupToggleIcons() {
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = document.getElementById(this.getAttribute('data-target'));
            if (input) input.type = input.type === 'password' ? 'text' : 'password';
        });
    });
}