// src/contexts/AuthContext.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getUser,
} from "../services/authService";
import { AuthContext } from "./AuthContext";
import { clearAuthData, getAccessToken, setAuthData } from "../utils/storage";

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
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return null;
    }
    
    setLoading(true);
    try {
      const userData = await getUser();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      // Token might be invalid - clear auth data
      clearAuthData();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize auth state on mount
   * Fetches user profile if access token exists
   */
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      getUserProfile();
    } else {
      setLoading(false);
    }
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
      console.error("Registration failed:", error);
      return { 
        success: false, 
        message: error?.response?.data?.message || "Đăng ký thất bại" 
      };
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

  // Context value - memoized to prevent unnecessary re-renders
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
    
    // Alias for backward compatibility
    fetchUserProfile: getUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
