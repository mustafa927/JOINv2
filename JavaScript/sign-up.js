import { auth, db, checkNetworkStatus } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { updateUserInitials } from './userInitials.js';

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const signupButton = document.getElementById('signupButton');
    const successMessage = document.getElementById('success-message');
    
    signupButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Reset all error messages
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.style.display = 'none';
        });
        const inputFields = document.querySelectorAll('.input-field input');
        inputFields.forEach(field => {
            field.classList.remove('error');
        });
        document.getElementById('privacy-policy').classList.remove('error');
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const privacyPolicy = document.getElementById('privacy-policy').checked;
        
        let hasError = false;
        
        // Name validation (muss Vor- und Nachname enthalten)
        if (!name || !name.includes(' ')) {
            const nameError = document.getElementById('name-error');
            if (nameError) {
                nameError.style.display = 'block';
                nameError.textContent = 'Bitte geben Sie Vor- und Nachnamen ein (durch Leerzeichen getrennt)';
                document.getElementById('name').classList.add('error');
            }
            hasError = true;
        }
        
        // Email validation
        if (!email) {
            const emailError = document.getElementById('email-error');
            if (emailError) {
                emailError.style.display = 'block';
                document.getElementById('email').classList.add('error');
            }
            hasError = true;
        } else {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                const emailFormatError = document.getElementById('email-format-error');
                if (emailFormatError) {
                    emailFormatError.style.display = 'block';
                    document.getElementById('email').classList.add('error');
                }
                hasError = true;
            }
        }
        
        // Password validation
        if (!password) {
            const passwordError = document.getElementById('password-error');
            if (passwordError) {
                passwordError.style.display = 'block';
                document.getElementById('password').classList.add('error');
            }
            hasError = true;
        }
        
        if (!confirmPassword) {
            const confirmPasswordError = document.getElementById('confirm-password-error');
            if (confirmPasswordError) {
                confirmPasswordError.style.display = 'block';
                document.getElementById('confirmPassword').classList.add('error');
            }
            hasError = true;
        }
        
        if (password && confirmPassword && password !== confirmPassword) {
            const passwordMatchError = document.getElementById('password-match-error');
            if (passwordMatchError) {
                passwordMatchError.style.display = 'block';
                document.getElementById('password').classList.add('error');
                document.getElementById('confirmPassword').classList.add('error');
            }
            hasError = true;
        }
        
        // Privacy policy validation
        if (!privacyPolicy) {
            const privacyError = document.getElementById('privacy-error');
            if (privacyError) {
                privacyError.style.display = 'block';
                document.getElementById('privacy-policy').classList.add('error');
            }
            hasError = true;
        }
        
        if (hasError) {
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            const userData = {
                name: name,
                email: email,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                tasks: [],
                contacts: []
            };

            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, userData);

            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                ...userData
            }));

            // Initialen sofort aktualisieren
            updateUserInitials();

            // Show success message
            successMessage.style.display = 'block';
            
            // After showing the message, redirect to another page
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            const generalError = document.getElementById('general-error');
            if (generalError) {
                let errorMessage = '';
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email is already registered.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Please enter a valid email address.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak.';
                        break;
                    default:
                        errorMessage = 'An error occurred during registration.';
                }
                generalError.textContent = errorMessage;
                generalError.style.display = 'block';
            }
        }
    });

    const toggleIcons = document.querySelectorAll('.toggle-password');

    toggleIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const inputId = this.getAttribute('data-target');
            const input = document.getElementById(inputId);
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                } else {
                    input.type = 'password';
                }
            }
        });
    });
});