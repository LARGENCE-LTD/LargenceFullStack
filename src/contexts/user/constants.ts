// Action types for user context
export const USER_ACTION_TYPES = {
  // Authentication
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_TOKEN: 'SET_TOKEN',
  LOGOUT: 'LOGOUT',
  
  // User data
  SET_PROFILE: 'SET_PROFILE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_SUBSCRIPTION: 'SET_SUBSCRIPTION',
  SET_USAGE: 'SET_USAGE',
  SET_PREFERENCES: 'SET_PREFERENCES',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  
  // Activity
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  SET_ACTIVITIES: 'SET_ACTIVITIES',
  
  // UI state
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Session
  UPDATE_LAST_ACTIVITY: 'UPDATE_LAST_ACTIVITY',
  SET_SESSION_EXPIRY: 'SET_SESSION_EXPIRY',
  
  // Reset
  RESET_USER: 'RESET_USER',
} as const;

// Storage keys for user context
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_SUBSCRIPTION: 'user_subscription',
  USER_USAGE: 'user_usage',
  USER_PREFERENCES: 'user_preferences',
  USER_ACTIVITIES: 'user_activities',
  USER_LAST_ACTIVITY: 'user_last_activity',
  USER_SESSION_EXPIRY: 'user_session_expiry',
} as const;

// API base URL
export const API_BASE_URL = '/api/users';

// Session check interval (5 minutes)
export const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

// Activity limit for storage
export const MAX_ACTIVITIES = 100; 