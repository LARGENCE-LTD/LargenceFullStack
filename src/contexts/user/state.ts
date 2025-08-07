import { USER_ACTION_TYPES } from './constants';
import { User } from '@supabase/supabase-js';

// User profile interface
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

// Subscription plan interface
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxDocuments: number;
  maxStorage: number; // in MB
}

// User subscription interface
export interface UserSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
}

// User usage statistics
export interface UserUsage {
  documentsGenerated: number;
  documentsThisMonth: number;
  storageUsed: number; // in MB
  storageLimit: number; // in MB
  lastActive: string;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: {
    documentUpdates: boolean;
    billingReminders: boolean;
    securityAlerts: boolean;
    marketing: boolean;
  };
  documentDefaults: {
    defaultType: string;
    autoSave: boolean;
    exportFormat: 'pdf' | 'word';
  };
}

// User activity log entry
export interface UserActivity {
  id: string;
  type: 'login' | 'logout' | 'document_created' | 'document_exported' | 'profile_updated' | 'subscription_changed';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// User state interface
export interface UserState {
  // Authentication
  isAuthenticated: boolean;
  user: User | null;
  
  // User data
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  usage: UserUsage | null;
  preferences: UserPreferences | null;
  
  // Activity and history
  activities: UserActivity[];
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Session management
  lastActivity: string | null;
  sessionExpiry: string | null;
}

// User action types
export type UserActionType = typeof USER_ACTION_TYPES[keyof typeof USER_ACTION_TYPES];

// User action interface
export type UserAction =
  | { type: typeof USER_ACTION_TYPES.SET_AUTHENTICATED; payload: boolean }
  | { type: typeof USER_ACTION_TYPES.SET_USER; payload: User | null }
  | { type: typeof USER_ACTION_TYPES.LOGOUT }
  
  | { type: typeof USER_ACTION_TYPES.SET_PROFILE; payload: UserProfile | null }
  | { type: typeof USER_ACTION_TYPES.UPDATE_PROFILE; payload: Partial<UserProfile> }
  | { type: typeof USER_ACTION_TYPES.SET_SUBSCRIPTION; payload: UserSubscription | null }
  | { type: typeof USER_ACTION_TYPES.SET_USAGE; payload: UserUsage | null }
  | { type: typeof USER_ACTION_TYPES.SET_PREFERENCES; payload: UserPreferences | null }
  | { type: typeof USER_ACTION_TYPES.UPDATE_PREFERENCES; payload: Partial<UserPreferences> }
  
  | { type: typeof USER_ACTION_TYPES.ADD_ACTIVITY; payload: UserActivity }
  | { type: typeof USER_ACTION_TYPES.SET_ACTIVITIES; payload: UserActivity[] }
  
  | { type: typeof USER_ACTION_TYPES.SET_LOADING; payload: boolean }
  | { type: typeof USER_ACTION_TYPES.SET_ERROR; payload: string | null }
  | { type: typeof USER_ACTION_TYPES.CLEAR_ERROR }
  
  | { type: typeof USER_ACTION_TYPES.UPDATE_LAST_ACTIVITY; payload: string }
  | { type: typeof USER_ACTION_TYPES.SET_SESSION_EXPIRY; payload: string | null }
  
  | { type: typeof USER_ACTION_TYPES.RESET_USER };

// Default user preferences
const defaultPreferences: UserPreferences = {
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
};

// Default usage statistics
const defaultUsage: UserUsage = {
  documentsGenerated: 0,
  documentsThisMonth: 0,
  storageUsed: 0,
  storageLimit: 100, // 100MB default
  lastActive: new Date().toISOString(),
};

// Initial user state
export const initialUserState: UserState = {
  // Authentication
  isAuthenticated: false,
  user: null,
  
  // User data
  profile: null,
  subscription: null,
  usage: defaultUsage,
  preferences: defaultPreferences,
  
  // Activity and history
  activities: [],
  
  // UI state
  loading: false,
  error: null,
  
  // Session management
  lastActivity: null,
  sessionExpiry: null,
};
