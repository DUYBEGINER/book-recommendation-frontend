// src/contexts/AuthContext.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  login as loginService,
  register as registerService,
  getUser,
} from "../services/authService";
import { AuthContext } from "./AuthContext";
import { clearAuthData, getAccessToken, setAuthData } from "../utils/storage";



function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("AuthProvider rendered. Current user:", user);

  const getUserProfile = useCallback(async () => {
    const token = getAccessToken();
    console.log("Fetching user profile with token:", token);
    if (!token) return null;
    setLoading(true);
    try {
      const userData = await getUser();
      console.log("User profile fetched successfully:", userData);
      setUser(userData);
    } catch (err) {
      console.error("Lỗi khi lấy user:", err);
    }
    finally {
      setLoading(false);
    } 
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      getUserProfile();
    } else {
      setLoading(false);
    }
  }, [getUserProfile]);


  // Login function
  const login = useCallback(async (emailInput, passwordInput) => {
    setLoading(true);

    try {
      const userData = await loginService(emailInput, passwordInput);
      console.log("Login successful:", userData);
      // Get accessToken and user info from response
      const accessToken = userData.accessToken;

      setAuthData(accessToken);
      // setJwt(jwt);
      setUser(userData?.user);

      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error(error?.response?.data.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await registerService(userData);
      console.log("Register response:", response);
      return {
        success: true,
      };
    } catch (error) {
      console.error("Register failed:", error);
      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    try {
      console.log("LOGGING OUT USER:", user);
      clearAuthData();
      setUser(null);
      return { success: true, message: "Logout successful" };
    } catch (error) {
      console.error("Logout operation failed:", error);
    }
  }, []);

  // Update user profile
  // const updateProfile = useCallback((updatedData) => {
  //   const updatedUser = { ...user, ...updatedData };
  //   localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  //   setUser(updatedUser);
  // }, [user]);

  // const setAuthTokenAndFetchUser = useCallback(async (token) => {
  //   if (!token) return;
  //   setAuthData(token, null);
  //   setJwt(token);
  //   await fetchUserProfile();
  // }, [fetchUserProfile]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    setUser,
    register,
    logout,
    getUserProfile,
    // fetchUserProfile,
    // setAuthTokenAndFetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
