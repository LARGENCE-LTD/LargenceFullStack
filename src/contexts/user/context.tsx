"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserState } from './state';
import { userReducer } from './reducer';
import { useUserActions } from './actions';
import { initialUserState } from './state';
import { SESSION_CHECK_INTERVAL } from './constants';

// TESTING FLAG - Set to false to remove test data
const USE_TEST_DATA = true;

// Test data for development
const testUserData = {
  profile: {
    id: "test-user-123",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    isVerified: true,
    isAdmin: false,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
  },
  subscription: {
    plan: {
      id: "pro-plan",
      name: "Pro Plan",
      price: 29.99,
      currency: "USD",
      interval: "monthly" as const,
      features: ["Unlimited documents", "Priority support", "Advanced templates"],
      maxDocuments: 1000,
      maxStorage: 500,
    },
    status: "active" as const,
    currentPeriodStart: "2024-01-01T00:00:00Z",
    currentPeriodEnd: "2024-02-01T00:00:00Z",
    nextBillingDate: "2024-02-01T00:00:00Z",
    cancelAtPeriodEnd: false,
  },
  usage: {
    documentsGenerated: 47,
    documentsThisMonth: 12,
    storageUsed: 156,
    storageLimit: 500,
    lastActive: new Date().toISOString(),
  },
  preferences: {
    theme: "light" as const,
    language: "en",
    timezone: "America/New_York",
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
  },
  activities: [
    {
      id: "act-1",
      type: "login" as const,
      description: "User logged in successfully",
      timestamp: new Date().toISOString(),
    },
    {
      id: "act-2",
      type: "document_created" as const,
      description: "Created NDA for TechCorp Inc.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "act-3",
      type: "document_exported" as const,
      description: "Exported Employment Contract as PDF",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
};

// Create the context types
interface UserContextType {
  state: UserState;
  actions: ReturnType<typeof useUserActions>;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with test data if flag is enabled
  const initialState = USE_TEST_DATA ? {
    ...initialUserState,
    isAuthenticated: true,
    token: "test-token-123",
    profile: testUserData.profile,
    subscription: testUserData.subscription,
    usage: testUserData.usage,
    preferences: testUserData.preferences,
    activities: testUserData.activities,
    lastActivity: new Date().toISOString(),
    sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  } : initialUserState;

  const [state, dispatch] = useReducer(userReducer, initialState);

  // Get actions, memoized and bound to this dispatch/state
  const actions = useUserActions(state, dispatch);

  // Initialize user data from localStorage on mount (only if not using test data)
  useEffect(() => {
    if (!USE_TEST_DATA) {
      actions.initializeFromStorage();
    }
  }, []);

  // Set up activity tracking
  useEffect(() => {
    const updateActivity = () => {
      if (state.isAuthenticated) {
        actions.addActivity('login', 'User activity detected');
      }
    };

    // Update activity on user interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [state.isAuthenticated]);

  // Session expiry check
  useEffect(() => {
    if (!state.isAuthenticated || !state.token) return;

    const checkSession = async () => {
      const isValid = await actions.validateSession();
      if (!isValid) {
        console.log('Session expired, logging out user');
      }
    };

    // Check session every 5 minutes
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.token]);

  return (
    <UserContext.Provider value={{ state, actions }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for consuming the context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Convenience hooks for specific parts of the user state
export const useUserProfile = () => {
  const { state } = useUser();
  return state.profile;
};

export const useUserSubscription = () => {
  const { state } = useUser();
  return state.subscription;
};

export const useUserUsage = () => {
  const { state } = useUser();
  return state.usage;
};

export const useUserPreferences = () => {
  const { state } = useUser();
  return state.preferences;
};

export const useUserActivities = () => {
  const { state } = useUser();
  return state.activities;
};

export const useUserAuth = () => {
  const { state, actions } = useUser();
  return {
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login: actions.login,
    logout: actions.logout,
    signup: actions.signup,
  };
};
