import { Dispatch } from "react";
import { UserAPI } from "./userAPI";
import { UserAction, UserState, UserPreferences } from "./state";
import { USER_ACTION_TYPES } from "./constants";
import { saveToStorage, loadFromStorage, clearStorage } from "./utils";

export function useUserActions(
  state: UserState,
  dispatch: Dispatch<UserAction>
) {
  // Authentication actions
  const login = async (email: string, password: string) => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTION_TYPES.CLEAR_ERROR });

    try {
      const response = await UserAPI.login(email, password);

      // Update state
      dispatch({ type: USER_ACTION_TYPES.SET_TOKEN, payload: response.token });
      dispatch({ type: USER_ACTION_TYPES.SET_AUTHENTICATED, payload: true });

      // Load user data
      await loadUserData(response.token);

      // Add activity
      addActivity("login", "User logged in successfully");
    } catch (error: any) {
      dispatch({ type: USER_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  const signup = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTION_TYPES.CLEAR_ERROR });

    try {
      await UserAPI.signup(userData);
      // Note: Signup doesn't automatically log in - user needs to login separately
    } catch (error: any) {
      dispatch({ type: USER_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  const logout = async () => {
    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });

    try {
      if (state.token) {
        await UserAPI.logout(state.token);
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API error:", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem("auth_token");
      clearStorage();

      // Reset state
      dispatch({ type: USER_ACTION_TYPES.LOGOUT });
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // User data loading
  const loadUserData = async (token: string) => {
    try {
      // Load profile, subscription, usage, and preferences in parallel
      const [profile, subscription, usage, preferences, activities] =
        await Promise.all([
          UserAPI.getProfile(token),
          UserAPI.getSubscription(token).catch(() => null), // Optional
          UserAPI.getUsage(token),
          UserAPI.getPreferences(token),
          UserAPI.getActivities(token, 20), // Load last 20 activities
        ]);

      dispatch({ type: USER_ACTION_TYPES.SET_PROFILE, payload: profile });
      dispatch({
        type: USER_ACTION_TYPES.SET_SUBSCRIPTION,
        payload: subscription,
      });
      dispatch({ type: USER_ACTION_TYPES.SET_USAGE, payload: usage });
      dispatch({
        type: USER_ACTION_TYPES.SET_PREFERENCES,
        payload: preferences,
      });
      dispatch({ type: USER_ACTION_TYPES.SET_ACTIVITIES, payload: activities });

      // Update last activity
      dispatch({
        type: USER_ACTION_TYPES.UPDATE_LAST_ACTIVITY,
        payload: new Date().toISOString(),
      });
    } catch (error: any) {
      dispatch({ type: USER_ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  };

  // Profile management
  const updateProfile = async (
    profileData: Partial<{ firstName: string; lastName: string; email: string }>
  ) => {
    if (!state.token) throw new Error("No authentication token");

    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTION_TYPES.CLEAR_ERROR });

    try {
      const updatedProfile = await UserAPI.updateProfile(
        state.token,
        profileData
      );
      dispatch({
        type: USER_ACTION_TYPES.SET_PROFILE,
        payload: updatedProfile,
      });

      addActivity("profile_updated", "Profile updated successfully");
    } catch (error: any) {
      dispatch({ type: USER_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!state.token) throw new Error("No authentication token");

    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTION_TYPES.CLEAR_ERROR });

    try {
      await UserAPI.changePassword(state.token, currentPassword, newPassword);
      addActivity("profile_updated", "Password changed successfully");
    } catch (error: any) {
      dispatch({ type: USER_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Subscription management
  const updateSubscription = async (planId: string) => {
    if (!state.token) throw new Error("No authentication token");

    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTION_TYPES.CLEAR_ERROR });

    try {
      const updatedSubscription = await UserAPI.updateSubscription(
        state.token,
        planId
      );
      dispatch({
        type: USER_ACTION_TYPES.SET_SUBSCRIPTION,
        payload: updatedSubscription,
      });

      addActivity(
        "subscription_changed",
        `Subscription updated to ${updatedSubscription.plan.name}`
      );
    } catch (error: any) {
      dispatch({ type: USER_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  const cancelSubscription = async () => {
    if (!state.token) throw new Error("No authentication token");

    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTION_TYPES.CLEAR_ERROR });

    try {
      const updatedSubscription = await UserAPI.cancelSubscription(state.token);
      dispatch({
        type: USER_ACTION_TYPES.SET_SUBSCRIPTION,
        payload: updatedSubscription,
      });

      addActivity("subscription_changed", "Subscription cancelled");
    } catch (error: any) {
      dispatch({ type: USER_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Preferences management
  const updatePreferences = async (
    preferences: Partial<{
      theme: "light" | "dark" | "system";
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
        exportFormat: "pdf" | "word";
      };
    }>
  ) => {
    if (!state.token) throw new Error("No authentication token");

    dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: USER_ACTION_TYPES.CLEAR_ERROR });

    try {
      const updatedPreferences = await UserAPI.updatePreferences(
        state.token,
        preferences
      );
      dispatch({
        type: USER_ACTION_TYPES.SET_PREFERENCES,
        payload: updatedPreferences,
      });

      // Save to localStorage for persistence
      saveToStorage("preferences", updatedPreferences);
    } catch (error: any) {
      dispatch({ type: USER_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: USER_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Activity management
  const addActivity = (
    type:
      | "login"
      | "logout"
      | "document_created"
      | "document_exported"
      | "profile_updated"
      | "subscription_changed",
    description: string,
    metadata?: Record<string, any>
  ) => {
    const activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      timestamp: new Date().toISOString(),
      metadata,
    };

    dispatch({ type: USER_ACTION_TYPES.ADD_ACTIVITY, payload: activity });
  };

  // Session management
  const refreshUserData = async () => {
    if (!state.token) return;

    try {
      await loadUserData(state.token);
    } catch (error: any) {
      // If token is invalid, logout user
      if (
        error.message.includes("unauthorized") ||
        error.message.includes("invalid token")
      ) {
        await logout();
      }
    }
  };

  const validateSession = async () => {
    if (!state.token) return false;

    // If using test data, always return true
    if (process.env.NODE_ENV === 'development' && state.token === 'test-token-123') {
      return true;
    }

    try {
      const isValid = await UserAPI.validateToken(state.token);
      if (!isValid) {
        await logout();
        return false;
      }
      return true;
    } catch {
      await logout();
      return false;
    }
  };

  // Initialize user from localStorage
  const initializeFromStorage = async () => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      dispatch({ type: USER_ACTION_TYPES.SET_TOKEN, payload: token });

      // Validate token and load user data
      const isValid = await validateSession();
      if (isValid) {
        dispatch({ type: USER_ACTION_TYPES.SET_AUTHENTICATED, payload: true });
        await loadUserData(token);
      }
    }

    // Load preferences from localStorage
    const savedPreferences = loadFromStorage("preferences");
    if (savedPreferences) {
      dispatch({
        type: USER_ACTION_TYPES.SET_PREFERENCES,
        payload: savedPreferences as UserPreferences,
      });
    }
  };

  // Utility actions
  const clearError = () => {
    dispatch({ type: USER_ACTION_TYPES.CLEAR_ERROR });
  };

  const resetUser = () => {
    dispatch({ type: USER_ACTION_TYPES.RESET_USER });
    clearStorage();
  };

  return {
    // Authentication
    login,
    signup,
    logout,

    // Profile management
    updateProfile,
    changePassword,

    // Subscription management
    updateSubscription,
    cancelSubscription,

    // Preferences
    updatePreferences,

    // Activity
    addActivity,

    // Session management
    refreshUserData,
    validateSession,
    initializeFromStorage,

    // Utilities
    clearError,
    resetUser,
  };
}
