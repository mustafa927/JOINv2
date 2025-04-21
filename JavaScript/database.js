// Import Firebase modules
import { auth, db } from './firebase.js';
import { doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Database utility for Join application
const DB_NAME = 'JoinDB';
const DB_VERSION = 1;

// Database stores
const STORES = {
    USERS: 'users',
    TASKS: 'tasks',
    CONTACTS: 'contacts'
};

class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create stores if they don't exist
                if (!db.objectStoreNames.contains(STORES.USERS)) {
                    db.createObjectStore(STORES.USERS, { keyPath: 'email' });
                }
                if (!db.objectStoreNames.contains(STORES.TASKS)) {
                    db.createObjectStore(STORES.TASKS, { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains(STORES.CONTACTS)) {
                    db.createObjectStore(STORES.CONTACTS, { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    // Generic method to add data to a store
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Generic method to get data from a store
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Generic method to update data in a store
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Generic method to delete data from a store
    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // User-specific methods
    async addUser(userData) {
        try {
            // First, add to Firestore
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            await setDoc(userDocRef, userData);
            
            // Then add to IndexedDB
            return this.add(STORES.USERS, userData);
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }

    async getUser(email) {
        try {
            // First try to get from Firestore
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                return userDoc.data();
            }
            
            // Fallback to IndexedDB
            return this.get(STORES.USERS, email);
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    async updateUser(userData) {
        try {
            // Update in Firestore
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            await setDoc(userDocRef, userData, { merge: true });
            
            // Update in IndexedDB
            return this.update(STORES.USERS, userData);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Task-specific methods
    async addTask(taskData) {
        return this.add(STORES.TASKS, taskData);
    }

    async getTask(id) {
        return this.get(STORES.TASKS, id);
    }

    async updateTask(taskData) {
        return this.update(STORES.TASKS, taskData);
    }

    async deleteTask(id) {
        return this.delete(STORES.TASKS, id);
    }

    // Contact-specific methods
    async addContact(contactData) {
        return this.add(STORES.CONTACTS, contactData);
    }

    async getContact(id) {
        return this.get(STORES.CONTACTS, id);
    }

    async updateContact(contactData) {
        return this.update(STORES.CONTACTS, contactData);
    }

    async deleteContact(id) {
        return this.delete(STORES.CONTACTS, id);
    }
}

// Create a singleton instance
const database = new Database();
export default database; 