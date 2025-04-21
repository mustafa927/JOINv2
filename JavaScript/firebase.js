import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true,
    useFetchStreams: false
});

let isOnline = navigator.onLine;

window.addEventListener('online', () => {
    isOnline = true;
});

window.addEventListener('offline', () => {
    isOnline = false;
});

setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
        console.warn('Local persistence failed, trying session persistence:', error);
        return setPersistence(auth, browserSessionPersistence);
    })
    .catch((error) => {
        console.error('All persistence attempts failed:', error);
    });

auth.useDeviceLanguage();

// Configure Firestore
const firestoreSettings = {
    cacheSizeBytes: 10000000,
    useFetchStreams: false
};

function checkNetworkStatus() {
    if (!navigator.onLine) {
        throw new Error('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkverbindung und versuchen Sie es erneut.');
    }
    return true;
}

export { auth, db, checkNetworkStatus, isOnline }; 