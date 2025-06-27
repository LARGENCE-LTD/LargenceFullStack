import { 
  UserProfile, 
  UserSubscription, 
  UserUsage, 
  UserPreferences, 
  UserActivity 
} from './state';
import { API_BASE_URL } from './constants';

export const UserAPI = {
  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return await response.json();
  },

  async signup(userData: { firstName: string; lastName: string; email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }
    
    return await response.json();
  },

  async logout(token: string) {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    return await response.json();
  },

  // Profile management
  async getProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return await response.json();
  },

  async updateProfile(token: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    
    return await response.json();
  },

  async changePassword(token: string, currentPassword: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }
    
    return await response.json();
  },

  // Subscription management
  async getSubscription(token: string): Promise<UserSubscription> {
    const response = await fetch(`${API_BASE_URL}/subscription`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }
    
    return await response.json();
  },

  async updateSubscription(token: string, planId: string) {
    const response = await fetch(`${API_BASE_URL}/subscription`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ planId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update subscription');
    }
    
    return await response.json();
  },

  async cancelSubscription(token: string) {
    const response = await fetch(`${API_BASE_URL}/subscription/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
    
    return await response.json();
  },

  // Usage statistics
  async getUsage(token: string): Promise<UserUsage> {
    const response = await fetch(`${API_BASE_URL}/usage`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch usage');
    }
    
    return await response.json();
  },

  // Preferences
  async getPreferences(token: string): Promise<UserPreferences> {
    const response = await fetch(`${API_BASE_URL}/preferences`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch preferences');
    }
    
    return await response.json();
  },

  async updatePreferences(token: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await fetch(`${API_BASE_URL}/preferences`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(preferences),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update preferences');
    }
    
    return await response.json();
  },

  // Activity history
  async getActivities(token: string, limit: number = 50): Promise<UserActivity[]> {
    const response = await fetch(`${API_BASE_URL}/activities?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    
    return await response.json();
  },

  // Session management
  async refreshToken(token: string) {
    const response = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    return await response.json();
  },

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/validate-token`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      return response.ok;
    } catch {
      return false;
    }
  },
}; 