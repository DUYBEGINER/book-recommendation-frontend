// src/contexts/AuthContext.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getUser,
} from "../../services/authService";
import { AuthContext } from "./AuthContext";
import { clearAuthData, getAccessToken, setAuthData } from "../../utils/storage";

/**
 * Authentication Provider Component
 * 
 * Provides authentication state and methods to the entire application.
 * Handles login, logout, registration, and user profile management.
 * 
 * Features:
 * - Access token stored in localStorage
 * - Refresh token stored in HttpOnly cookie (managed by backend)
 * - Automatic profile fetch on mount if token exists
 * - Supports both email/password and OAuth authentication
 */
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user profile from API
   * Called on initial load and after OAuth callback
   * 
   * @returns {Promise<Object|null>} User data or null
   */
  const getUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await getUser();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        clearAuthData();
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      let token = getAccessToken();

      if (token) {
        await getUserProfile();
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, [getUserProfile]);

  /**
   * Login with email and password
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} User data with role
   * @throws {Error} If login fails
   */

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await loginService(email, password);
      const { accessToken, user: userData } = response;
      
      // Store access token
      setAuthData(accessToken);
      setUser(userData);
      
      return { ...userData, role: userData.role };
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error(error?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register new user account
   * 
   * @param {Object} userData - Registration data (email, password, fullName)
   * @returns {Promise<Object>} Result with success flag
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      await registerService(userData);
      return { success: true };
    } catch (error) {
      throw new Error(error?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout current user
   * Clears local auth data and calls logout API
   * 
   * @returns {Promise<Object>} Result with success flag
   */
  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local cleanup even if API fails
    } finally {
      clearAuthData();
      setUser(null);
    }
    return { success: true };
  }, []);

  /**
   * Update user state and optionally store a new access token
   *
   * Called after profile/avatar updates so the context stays in sync
   * without an extra round-trip to /auth/profile.
   *
   * @param {Object} partialUserData - Fields to merge into the current user
   * @param {string|null} newAccessToken - New JWT issued by the update endpoint
   */
  const updateUser = useCallback((partialUserData, newAccessToken = null) => {
    if (newAccessToken) setAuthData(newAccessToken);
    setUser((prev) => (prev ? { ...prev, ...partialUserData } : prev));
  }, []);

  const value = {
    // State
    user,
    loading,
    isAuthenticated: !!user,

    // Methods
    login,
    register,
    logout,
    setUser,
    getUserProfile,
    updateUser,

    // Alias for backward compatibility
    fetchUserProfile: getUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
