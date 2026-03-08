/**
 * Safe Storage Utilities
 * Provides error-safe wrappers for localStorage and sessionStorage operations
 */

/**
 * Safely set a value in localStorage
 * @returns true if successful, false if failed
 */
export function safeLocalStorageSet<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Failed to save to localStorage (${key}):`, error);
    }
    return false;
  }
}

/**
 * Safely get a value from localStorage
 * @returns parsed value or null if failed/not found
 */
export function safeLocalStorageGet<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Failed to load from localStorage (${key}):`, error);
    }
    return null;
  }
}

/**
 * Safely remove a value from localStorage
 * @returns true if successful, false if failed
 */
export function safeLocalStorageRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Failed to remove from localStorage (${key}):`, error);
    }
    return false;
  }
}

/**
 * Safely set a value in sessionStorage
 * @returns true if successful, false if failed
 */
export function safeSessionStorageSet<T>(key: string, value: T): boolean {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Failed to save to sessionStorage (${key}):`, error);
    }
    return false;
  }
}

/**
 * Safely get a value from sessionStorage
 * @returns parsed value or null if failed/not found
 */
export function safeSessionStorageGet<T>(key: string): T | null {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Failed to load from sessionStorage (${key}):`, error);
    }
    return null;
  }
}

/**
 * Safely remove a value from sessionStorage
 * @returns true if successful, false if failed
 */
export function safeSessionStorageRemove(key: string): boolean {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Failed to remove from sessionStorage (${key}):`, error);
    }
    return false;
  }
}

