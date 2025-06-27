import { UserState, UserAction } from './state';
import { USER_ACTION_TYPES } from './constants';

export function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    // Authentication actions
    case USER_ACTION_TYPES.SET_AUTHENTICATED:
      return { ...state, isAuthenticated: action.payload };
    
    case USER_ACTION_TYPES.SET_TOKEN:
      return { ...state, token: action.payload };
    
    case USER_ACTION_TYPES.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        profile: null,
        subscription: null,
        activities: [],
        lastActivity: null,
        sessionExpiry: null,
      };
    
    // User data actions
    case USER_ACTION_TYPES.SET_PROFILE:
      return { ...state, profile: action.payload };
    
    case USER_ACTION_TYPES.UPDATE_PROFILE:
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null,
      };
    
    case USER_ACTION_TYPES.SET_SUBSCRIPTION:
      return { ...state, subscription: action.payload };
    
    case USER_ACTION_TYPES.SET_USAGE:
      return { ...state, usage: action.payload };
    
    case USER_ACTION_TYPES.SET_PREFERENCES:
      return { ...state, preferences: action.payload };
    
    case USER_ACTION_TYPES.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: state.preferences ? { ...state.preferences, ...action.payload } : null,
      };
    
    // Activity actions
    case USER_ACTION_TYPES.ADD_ACTIVITY:
      return {
        ...state,
        activities: [action.payload, ...state.activities].slice(0, 100), // Keep last 100 activities
      };
    
    case USER_ACTION_TYPES.SET_ACTIVITIES:
      return { ...state, activities: action.payload };
    
    // UI state actions
    case USER_ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case USER_ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case USER_ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };
    
    // Session actions
    case USER_ACTION_TYPES.UPDATE_LAST_ACTIVITY:
      return { ...state, lastActivity: action.payload };
    
    case USER_ACTION_TYPES.SET_SESSION_EXPIRY:
      return { ...state, sessionExpiry: action.payload };
    
    // Reset action
    case USER_ACTION_TYPES.RESET_USER:
      return {
        isAuthenticated: false,
        token: null,
        profile: null,
        subscription: null,
        usage: {
          documentsGenerated: 0,
          documentsThisMonth: 0,
          storageUsed: 0,
          storageLimit: 100,
          lastActive: new Date().toISOString(),
        },
        preferences: {
          theme: 'system',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: {
            documentUpdates: true,
            billingReminders: true,
            securityAlerts: true,
            marketing: false,
          },
          documentDefaults: {
            defaultType: 'nda',
            autoSave: true,
            exportFormat: 'pdf',
          },
        },
        activities: [],
        loading: false,
        error: null,
        lastActivity: null,
        sessionExpiry: null,
      };
    
    default:
      return state;
  }
} 