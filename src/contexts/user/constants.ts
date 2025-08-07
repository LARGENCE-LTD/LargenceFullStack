// Action types for user context
export const USER_ACTION_TYPES = {
  // Authentication
  SET_AUTHENTICATED: "SET_AUTHENTICATED",
  SET_USER: "SET_USER",
  LOGOUT: "LOGOUT",
  
  // User data
  SET_PROFILE: "SET_PROFILE",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  SET_SUBSCRIPTION: "SET_SUBSCRIPTION",
  SET_USAGE: "SET_USAGE",
  SET_PREFERENCES: "SET_PREFERENCES",
  UPDATE_PREFERENCES: "UPDATE_PREFERENCES",
  
  // Activity and history
  ADD_ACTIVITY: "ADD_ACTIVITY",
  SET_ACTIVITIES: "SET_ACTIVITIES",
  
  // UI state
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  
  // Session management
  UPDATE_LAST_ACTIVITY: "UPDATE_LAST_ACTIVITY",
  SET_SESSION_EXPIRY: "SET_SESSION_EXPIRY",
  
  // Reset
  RESET_USER: "RESET_USER",
} as const;

// Storage keys for user context
export const STORAGE_KEYS = {
  USER_PROFILE: "user_profile",
  USER_PREFERENCES: "user_preferences",
  USER_ACTIVITIES: "user_activities",
  USER_SUBSCRIPTION: "user_subscription",
  USER_USAGE: "user_usage",
} as const;

// Session check interval (5 minutes)
export const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

// Activity types
export const ACTIVITY_TYPES = {
  LOGIN: "login",
  LOGOUT: "logout",
  DOCUMENT_CREATED: "document_created",
  DOCUMENT_EXPORTED: "document_exported",
  PROFILE_UPDATED: "profile_updated",
  SUBSCRIPTION_CHANGED: "subscription_changed",
} as const;

// User preferences defaults
export const DEFAULT_PREFERENCES = {
  theme: "system" as const,
  language: "en",
  timezone: "UTC",
  emailNotifications: {
    documentUpdates: true,
    billingReminders: true,
    securityAlerts: true,
    marketing: false,
  },
  documentDefaults: {
    defaultType: "nda",
    autoSave: true,
    exportFormat: "pdf" as const,
  },
};

// Usage limits
export const USAGE_LIMITS = {
  FREE: {
    documentsPerMonth: 5,
    storageLimit: 100, // MB
  },
  PRO: {
    documentsPerMonth: 1000,
    storageLimit: 500, // MB
  },
  ENTERPRISE: {
    documentsPerMonth: -1, // Unlimited
    storageLimit: 5000, // MB
  },
} as const; 