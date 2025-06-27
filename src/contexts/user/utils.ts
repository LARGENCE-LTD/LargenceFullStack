import { STORAGE_KEYS } from './constants';

// Save data to localStorage
export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
}

// Load data from localStorage
export function loadFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return null;
  }
}

// Remove data from localStorage
export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error);
  }
}

// Clear all user-related data from localStorage
export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear user storage:', error);
  }
}

// Save user profile
export function saveUserProfile(profile: any): void {
  saveToStorage(STORAGE_KEYS.USER_PROFILE, profile);
}

// Load user profile
export function loadUserProfile(): any {
  return loadFromStorage(STORAGE_KEYS.USER_PROFILE);
}

// Save user subscription
export function saveUserSubscription(subscription: any): void {
  saveToStorage(STORAGE_KEYS.USER_SUBSCRIPTION, subscription);
}

// Load user subscription
export function loadUserSubscription(): any {
  return loadFromStorage(STORAGE_KEYS.USER_SUBSCRIPTION);
}

// Save user usage
export function saveUserUsage(usage: any): void {
  saveToStorage(STORAGE_KEYS.USER_USAGE, usage);
}

// Load user usage
export function loadUserUsage(): any {
  return loadFromStorage(STORAGE_KEYS.USER_USAGE);
}

// Save user preferences
export function saveUserPreferences(preferences: any): void {
  saveToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
}

// Load user preferences
export function loadUserPreferences(): any {
  return loadFromStorage(STORAGE_KEYS.USER_PREFERENCES);
}

// Save user activities
export function saveUserActivities(activities: any[]): void {
  saveToStorage(STORAGE_KEYS.USER_ACTIVITIES, activities);
}

// Load user activities
export function loadUserActivities(): any[] {
  return loadFromStorage(STORAGE_KEYS.USER_ACTIVITIES) || [];
}

// Save last activity timestamp
export function saveLastActivity(timestamp: string): void {
  saveToStorage(STORAGE_KEYS.USER_LAST_ACTIVITY, timestamp);
}

// Load last activity timestamp
export function loadLastActivity(): string | null {
  return loadFromStorage(STORAGE_KEYS.USER_LAST_ACTIVITY);
}

// Save session expiry
export function saveSessionExpiry(expiry: string): void {
  saveToStorage(STORAGE_KEYS.USER_SESSION_EXPIRY, expiry);
}

// Load session expiry
export function loadSessionExpiry(): string | null {
  return loadFromStorage(STORAGE_KEYS.USER_SESSION_EXPIRY);
}

// Check if session is expired
export function isSessionExpired(): boolean {
  const expiry = loadSessionExpiry();
  if (!expiry) return true;
  
  return new Date(expiry) < new Date();
}

// Get storage usage information
export function getStorageInfo(): { used: number; available: number; total: number } {
  if (typeof window === 'undefined') {
    return { used: 0, available: 0, total: 0 };
  }
  
  try {
    let used = 0;
    let total = 0;
    
    // Calculate used space
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Estimate total available space (varies by browser)
    total = 5 * 1024 * 1024; // 5MB estimate
    
    return {
      used,
      available: total - used,
      total,
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { used: 0, available: 0, total: 0 };
  }
} 