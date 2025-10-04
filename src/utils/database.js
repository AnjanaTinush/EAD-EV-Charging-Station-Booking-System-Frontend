// SQLite Database Helper for User Management (using IndexedDB for browser storage)

const DB_NAME = 'EVChargingStationDB';
const DB_VERSION = 1;
const USERS_STORE = 'users';

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create users store if it doesn't exist
        if (!db.objectStoreNames.contains(USERS_STORE)) {
          const usersStore = db.createObjectStore(USERS_STORE, { keyPath: 'id', autoIncrement: true });
          usersStore.createIndex('nic', 'nic', { unique: true });
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('role', 'role', { unique: false });
          usersStore.createIndex('isActive', 'isActive', { unique: false });
        }
      };
    });
  }

  async addUser(user) {
    const transaction = this.db.transaction([USERS_STORE], 'readwrite');
    const store = transaction.objectStore(USERS_STORE);

    const userData = {
      ...user,
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(userData);
      request.onsuccess = () => resolve({ ...userData, id: request.result });
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(id) {
    const transaction = this.db.transaction([USERS_STORE], 'readonly');
    const store = transaction.objectStore(USERS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByNIC(nic) {
    const transaction = this.db.transaction([USERS_STORE], 'readonly');
    const store = transaction.objectStore(USERS_STORE);
    const index = store.index('nic');

    return new Promise((resolve, reject) => {
      const request = index.get(nic);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email) {
    const transaction = this.db.transaction([USERS_STORE], 'readonly');
    const store = transaction.objectStore(USERS_STORE);
    const index = store.index('email');

    return new Promise((resolve, reject) => {
      const request = index.get(email);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers() {
    const transaction = this.db.transaction([USERS_STORE], 'readonly');
    const store = transaction.objectStore(USERS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(id, userData) {
    const transaction = this.db.transaction([USERS_STORE], 'readwrite');
    const store = transaction.objectStore(USERS_STORE);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingUser = getRequest.result;
        if (!existingUser) {
          reject(new Error('User not found'));
          return;
        }

        const updatedUser = {
          ...existingUser,
          ...userData,
          id: id, // Preserve the ID
          updatedAt: new Date().toISOString()
        };

        const updateRequest = store.put(updatedUser);
        updateRequest.onsuccess = () => resolve(updatedUser);
        updateRequest.onerror = () => reject(updateRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteUser(id) {
    const transaction = this.db.transaction([USERS_STORE], 'readwrite');
    const store = transaction.objectStore(USERS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deactivateUser(id) {
    return this.updateUser(id, { isActive: false });
  }

  async reactivateUser(id) {
    return this.updateUser(id, { isActive: true });
  }

  async syncUserFromAPI(apiUser) {
    // Sync user from API to local database
    const existingUser = await this.getUserByNIC(apiUser.nic);

    if (existingUser) {
      return this.updateUser(existingUser.id, apiUser);
    } else {
      return this.addUser(apiUser);
    }
  }

  async clearAllUsers() {
    const transaction = this.db.transaction([USERS_STORE], 'readwrite');
    const store = transaction.objectStore(USERS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Create singleton instance
const database = new Database();

export default database;
