import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAiWyDIcK6gBjP7lipndlyQKRRTur3bMJM",
    authDomain: "join-cdaed.firebaseapp.com",
    projectId: "join-cdaed",
    storageBucket: "join-cdaed.firebasestorage.app",
    messagingSenderId: "1011323047215",
    appId: "1:1011323047215:web:3b2b767a267dfac58165da",
    measurementId: "G-VQ5RF4327C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = setupFirestore(app);

let isOnline = navigator.onLine;
setupNetworkListeners();

setAuthPersistence(auth);

auth.useDeviceLanguage();

function setupFirestore(app) {
    return initializeFirestore(app, {
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        experimentalForceLongPolling: true,
        useFetchStreams: false
    });
}

function setupNetworkListeners() {
    window.addEventListener('online', () => { isOnline = true; });
    window.addEventListener('offline', () => { isOnline = false; });
}

function setAuthPersistence(auth) {
    setPersistence(auth, browserLocalPersistence)
        .catch(() => setPersistence(auth, browserSessionPersistence))
        .catch((error) => {
            console.error('All persistence attempts failed:', error);
        });
}

function checkNetworkStatus() {
    if (!navigator.onLine) {
        throw new Error('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkverbindung und versuchen Sie es erneut.');
    }
    return true;
}

export { auth, db, checkNetworkStatus, isOnline }; 