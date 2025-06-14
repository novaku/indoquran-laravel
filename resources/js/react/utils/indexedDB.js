// IndexedDB utility for caching user authentication data
const DB_NAME = 'indoquran_app';
const DB_VERSION = 1;
const USER_STORE = 'user_data';
const AUTH_STORE = 'auth_cache';

class IndexedDBManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    // Initialize IndexedDB
    async init() {
        if (this.isInitialized && this.db) {
            return this.db;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('❌ [IndexedDB] Failed to open database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('✅ [IndexedDB] Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('🔄 [IndexedDB] Database upgrade needed');

                // Create user data store
                if (!db.objectStoreNames.contains(USER_STORE)) {
                    const userStore = db.createObjectStore(USER_STORE, { keyPath: 'id' });
                    userStore.createIndex('email', 'email', { unique: true });
                    console.log('📦 [IndexedDB] Created user data store');
                }

                // Create auth cache store
                if (!db.objectStoreNames.contains(AUTH_STORE)) {
                    const authStore = db.createObjectStore(AUTH_STORE, { keyPath: 'key' });
                    console.log('📦 [IndexedDB] Created auth cache store');
                }
            };
        });
    }

    // Store user data
    async setUser(userData) {
        try {
            await this.init();
            
            const transaction = this.db.transaction([USER_STORE], 'readwrite');
            const store = transaction.objectStore(USER_STORE);
            
            const userToStore = {
                ...userData,
                cached_at: new Date().toISOString(),
                last_accessed: new Date().toISOString()
            };

            await new Promise((resolve, reject) => {
                const request = store.put(userToStore);
                request.onsuccess = () => {
                    console.log('💾 [IndexedDB] User data stored successfully:', {
                        userId: userData.id,
                        name: userData.name,
                        email: userData.email
                    });
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });

            // Also store auth timestamp
            await this.setAuthCache('last_login', {
                timestamp: Date.now(),
                user_id: userData.id
            });

        } catch (error) {
            console.error('❌ [IndexedDB] Failed to store user data:', error);
            throw error;
        }
    }

    // Get user data
    async getUser(userId = null) {
        try {
            await this.init();

            const transaction = this.db.transaction([USER_STORE], 'readonly');
            const store = transaction.objectStore(USER_STORE);

            if (userId) {
                // Get specific user by ID
                return new Promise((resolve, reject) => {
                    const request = store.get(userId);
                    request.onsuccess = () => {
                        const user = request.result;
                        if (user) {
                            // Update last accessed time
                            this.updateLastAccessed(userId);
                            console.log('📖 [IndexedDB] User data retrieved:', {
                                userId: user.id,
                                name: user.name,
                                email: user.email,
                                cached_at: user.cached_at
                            });
                        }
                        resolve(user || null);
                    };
                    request.onerror = () => reject(request.error);
                });
            } else {
                // Get the most recently logged in user
                const lastLogin = await this.getAuthCache('last_login');
                if (lastLogin && lastLogin.user_id) {
                    return this.getUser(lastLogin.user_id);
                }
                return null;
            }
        } catch (error) {
            console.error('❌ [IndexedDB] Failed to get user data:', error);
            return null;
        }
    }

    // Update last accessed time for a user
    async updateLastAccessed(userId) {
        try {
            await this.init();
            
            const transaction = this.db.transaction([USER_STORE], 'readwrite');
            const store = transaction.objectStore(USER_STORE);
            
            const request = store.get(userId);
            request.onsuccess = () => {
                const user = request.result;
                if (user) {
                    user.last_accessed = new Date().toISOString();
                    store.put(user);
                }
            };
        } catch (error) {
            console.error('❌ [IndexedDB] Failed to update last accessed time:', error);
        }
    }

    // Clear user data (logout)
    async clearUser(userId = null) {
        try {
            await this.init();

            const transaction = this.db.transaction([USER_STORE], 'readwrite');
            const store = transaction.objectStore(USER_STORE);

            if (userId) {
                // Clear specific user
                await new Promise((resolve, reject) => {
                    const request = store.delete(userId);
                    request.onsuccess = () => {
                        console.log('🗑️ [IndexedDB] User data cleared for user ID:', userId);
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });
            } else {
                // Clear all users
                await new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => {
                        console.log('🗑️ [IndexedDB] All user data cleared');
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });
            }

            // Clear auth cache
            await this.clearAuthCache();

        } catch (error) {
            console.error('❌ [IndexedDB] Failed to clear user data:', error);
            throw error;
        }
    }

    // Store auth cache data
    async setAuthCache(key, data) {
        try {
            await this.init();
            
            const transaction = this.db.transaction([AUTH_STORE], 'readwrite');
            const store = transaction.objectStore(AUTH_STORE);
            
            const cacheData = {
                key,
                data,
                timestamp: Date.now(),
                expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours default
            };

            await new Promise((resolve, reject) => {
                const request = store.put(cacheData);
                request.onsuccess = () => {
                    console.log('💾 [IndexedDB] Auth cache stored:', key);
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });

        } catch (error) {
            console.error('❌ [IndexedDB] Failed to store auth cache:', error);
            throw error;
        }
    }

    // Get auth cache data
    async getAuthCache(key) {
        try {
            await this.init();

            const transaction = this.db.transaction([AUTH_STORE], 'readonly');
            const store = transaction.objectStore(AUTH_STORE);

            return new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = () => {
                    const result = request.result;
                    if (result) {
                        // Check if cache has expired
                        if (Date.now() > result.expires_at) {
                            console.log('⏰ [IndexedDB] Auth cache expired:', key);
                            this.clearAuthCache(key);
                            resolve(null);
                        } else {
                            console.log('📖 [IndexedDB] Auth cache retrieved:', key);
                            resolve(result.data);
                        }
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });

        } catch (error) {
            console.error('❌ [IndexedDB] Failed to get auth cache:', error);
            return null;
        }
    }

    // Clear auth cache
    async clearAuthCache(key = null) {
        try {
            await this.init();

            const transaction = this.db.transaction([AUTH_STORE], 'readwrite');
            const store = transaction.objectStore(AUTH_STORE);

            if (key) {
                // Clear specific cache entry
                await new Promise((resolve, reject) => {
                    const request = store.delete(key);
                    request.onsuccess = () => {
                        console.log('🗑️ [IndexedDB] Auth cache cleared:', key);
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });
            } else {
                // Clear all auth cache
                await new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => {
                        console.log('🗑️ [IndexedDB] All auth cache cleared');
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });
            }

        } catch (error) {
            console.error('❌ [IndexedDB] Failed to clear auth cache:', error);
            throw error;
        }
    }

    // Check if user data exists and is recent
    async hasValidUserCache() {
        try {
            const lastLogin = await this.getAuthCache('last_login');
            if (!lastLogin) return false;

            const user = await this.getUser(lastLogin.user_id);
            if (!user) return false;

            // Check if cache is less than 24 hours old
            const cacheAge = Date.now() - new Date(user.cached_at).getTime();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            const isValid = cacheAge < maxAge;
            console.log('🔍 [IndexedDB] User cache validation:', {
                hasUser: !!user,
                cacheAge: Math.round(cacheAge / (60 * 1000)), // in minutes
                maxAge: Math.round(maxAge / (60 * 1000)), // in minutes
                isValid
            });

            return isValid;
        } catch (error) {
            console.error('❌ [IndexedDB] Failed to validate user cache:', error);
            return false;
        }
    }

    // Get database statistics
    async getStats() {
        try {
            await this.init();

            const userTransaction = this.db.transaction([USER_STORE], 'readonly');
            const userStore = userTransaction.objectStore(USER_STORE);

            const authTransaction = this.db.transaction([AUTH_STORE], 'readonly');
            const authStore = authTransaction.objectStore(AUTH_STORE);

            const userCount = await new Promise((resolve) => {
                const request = userStore.count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(0);
            });

            const authCount = await new Promise((resolve) => {
                const request = authStore.count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(0);
            });

            const stats = {
                users: userCount,
                authCache: authCount,
                dbName: DB_NAME,
                dbVersion: DB_VERSION
            };

            console.log('📊 [IndexedDB] Database stats:', stats);
            return stats;

        } catch (error) {
            console.error('❌ [IndexedDB] Failed to get database stats:', error);
            return { users: 0, authCache: 0, dbName: DB_NAME, dbVersion: DB_VERSION };
        }
    }
}

// Create singleton instance
const indexedDBManager = new IndexedDBManager();

export default indexedDBManager;
