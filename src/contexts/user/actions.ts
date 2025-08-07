import { Dispatch } from 'react';
import { supabase } from '@/lib/supabase';
import { UserState, UserAction } from './state';
import { USER_ACTION_TYPES } from './constants';

export function useUserActions(
  state: UserState,
  dispatch: Dispatch<UserAction>
) {
  // Login with Supabase Auth
  const login = async (email: string, password: string) => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTION_TYPES.SET_ERROR, payload: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      dispatch({ type: USER_ACTION_TYPES.SET_AUTHENTICATED, payload: true });
      dispatch({ type: USER_ACTION_TYPES.SET_USER, payload: data.user });
      
      // Add login activity
      dispatch({
        type: USER_ACTION_TYPES.ADD_ACTIVITY,
        payload: {
          id: `act_${Date.now()}`,
          type: 'login',
          description: 'User logged in successfully',
          timestamp: new Date().toISOString(),
        },
      });

      // Update last activity
      dispatch({
        type: USER_ACTION_TYPES.UPDATE_LAST_ACTIVITY,
        payload: new Date().toISOString(),
      });
    } catch (error: any) {
      dispatch({
        type: USER_ACTION_TYPES.SET_ERROR,
        payload: error.message || 'Login failed',
      });
    } finally {
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Signup with Supabase Auth
  const signup = async (email: string, password: string, userData: any) => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTION_TYPES.SET_ERROR, payload: null });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      dispatch({ type: USER_ACTION_TYPES.SET_AUTHENTICATED, payload: true });
      dispatch({ type: USER_ACTION_TYPES.SET_USER, payload: data.user });
      
      // Add signup activity
      dispatch({
        type: USER_ACTION_TYPES.ADD_ACTIVITY,
        payload: {
          id: `act_${Date.now()}`,
          type: 'login',
          description: 'User account created successfully',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      dispatch({
        type: USER_ACTION_TYPES.SET_ERROR,
        payload: error.message || 'Signup failed',
      });
    } finally {
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Logout with Supabase Auth
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Add logout activity before clearing state
      dispatch({
        type: USER_ACTION_TYPES.ADD_ACTIVITY,
        payload: {
          id: `act_${Date.now()}`,
          type: 'logout',
          description: 'User logged out',
          timestamp: new Date().toISOString(),
        },
      });

      dispatch({ type: USER_ACTION_TYPES.LOGOUT });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still reset state even if logout fails
      dispatch({ type: USER_ACTION_TYPES.LOGOUT });
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<any>) => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      dispatch({
        type: USER_ACTION_TYPES.UPDATE_PROFILE,
        payload: updates,
      });

      // Add profile update activity
      dispatch({
        type: USER_ACTION_TYPES.ADD_ACTIVITY,
        payload: {
          id: `act_${Date.now()}`,
          type: 'profile_updated',
          description: 'Profile information updated',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      dispatch({
        type: USER_ACTION_TYPES.SET_ERROR,
        payload: error.message || 'Profile update failed',
      });
    } finally {
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Update user preferences
  const updatePreferences = (updates: Partial<any>) => {
    dispatch({
      type: USER_ACTION_TYPES.UPDATE_PREFERENCES,
      payload: updates,
    });
  };

  // Validate session
  const validateSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return false;
      }

      // Update last activity
      dispatch({
        type: USER_ACTION_TYPES.UPDATE_LAST_ACTIVITY,
        payload: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  // Initialize from storage
  const initializeFromStorage = () => {
    try {
      // Load user data from localStorage if available
      const storedProfile = localStorage.getItem('user_profile');
      const storedPreferences = localStorage.getItem('user_preferences');
      const storedActivities = localStorage.getItem('user_activities');

      if (storedProfile) {
        dispatch({
          type: USER_ACTION_TYPES.SET_PROFILE,
          payload: JSON.parse(storedProfile),
        });
      }

      if (storedPreferences) {
        dispatch({
          type: USER_ACTION_TYPES.SET_PREFERENCES,
          payload: JSON.parse(storedPreferences),
        });
      }

      if (storedActivities) {
        dispatch({
          type: USER_ACTION_TYPES.SET_ACTIVITIES,
          payload: JSON.parse(storedActivities),
        });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  // Save to storage
  const saveToStorage = () => {
    try {
      if (state.profile) {
        localStorage.setItem('user_profile', JSON.stringify(state.profile));
      }
      if (state.preferences) {
        localStorage.setItem('user_preferences', JSON.stringify(state.preferences));
      }
      if (state.activities.length > 0) {
        localStorage.setItem('user_activities', JSON.stringify(state.activities));
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: USER_ACTION_TYPES.CLEAR_ERROR });
  };

  return {
    login,
    signup,
    logout,
    updateProfile,
    updatePreferences,
    validateSession,
    initializeFromStorage,
    saveToStorage,
    clearError,
  };
}
