"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserState } from './state';
import { userReducer } from './reducer';
import { useUserActions } from './actions';
import { initialUserState } from './state';
import { SESSION_CHECK_INTERVAL } from './constants';

// Create the context types
interface UserContextType {
  state: UserState;
  actions: ReturnType<typeof useUserActions>;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialUserState);

  // Get actions, memoized and bound to this dispatch/state
  const actions = useUserActions(state, dispatch);

  // Initialize user data from localStorage on mount
  useEffect(() => {
    actions.initializeFromStorage();
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
