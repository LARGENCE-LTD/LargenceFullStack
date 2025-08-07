import { UserState, UserAction } from './state';
import { USER_ACTION_TYPES } from './constants';

export function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case USER_ACTION_TYPES.SET_AUTHENTICATED:
      return { ...state, isAuthenticated: action.payload };

    case USER_ACTION_TYPES.SET_USER:
      return { ...state, user: action.payload };

    case USER_ACTION_TYPES.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        profile: null,
        subscription: null,
        usage: null,
        preferences: null,
        activities: [],
        loading: false,
        error: null,
        lastActivity: null,
        sessionExpiry: null,
      };

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

    case USER_ACTION_TYPES.ADD_ACTIVITY:
      return {
        ...state,
        activities: [action.payload, ...state.activities.slice(0, 99)], // Keep last 100 activities
      };

    case USER_ACTION_TYPES.SET_ACTIVITIES:
      return { ...state, activities: action.payload };

    case USER_ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };

    case USER_ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case USER_ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };

    case USER_ACTION_TYPES.UPDATE_LAST_ACTIVITY:
      return { ...state, lastActivity: action.payload };

    case USER_ACTION_TYPES.SET_SESSION_EXPIRY:
      return { ...state, sessionExpiry: action.payload };

    case USER_ACTION_TYPES.RESET_USER:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        profile: null,
        subscription: null,
        usage: null,
        preferences: null,
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