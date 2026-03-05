import React, { useEffect, useCallback } from "react";

/**
 * Google Sign-In Button Component
 * 
 * Uses Google Identity Services (GIS) library for authentication.
 * Configured in "redirect" mode - redirects to backend OAuth endpoint.
 * 
 * Required environment variables:
 * - VITE_GOOGLE_CLIENT_ID: Google OAuth 2.0 Client ID
 * - VITE_API_BASE_URL: Backend API base URL
 * 
 * @see https://developers.google.com/identity/gsi/web/guides/overview
 */
function ButtonLoginGoogle() {
  // Get configuration from environment
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  /**
   * Initialize Google Identity Services
   * Called once when component mounts
   */
  const initializeGoogleSignIn = useCallback(() => {
    // Ensure Google SDK is loaded
    if (!window.google?.accounts?.id) {
      console.error('Google Identity Services SDK not loaded');
      return;
    }

    // Validate configuration
    if (!GOOGLE_CLIENT_ID) {
      console.error('VITE_GOOGLE_CLIENT_ID environment variable is not set');
      return;
    }

    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      ux_mode: "redirect",
      login_uri: `${API_BASE_URL}/auth/google`,
    });

    // Render the sign-in button
    const buttonContainer = document.getElementById("google-signin-button");
    if (buttonContainer) {
      window.google.accounts.id.renderButton(buttonContainer, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        locale: "vi_VN",
      });
    }
  }, [GOOGLE_CLIENT_ID, API_BASE_URL]);

  useEffect(() => {
    // Check if SDK is already loaded
    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
      return;
    }

    // Wait for SDK to load (it's loaded via script tag in index.html)
    const checkGoogleLoaded = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleLoaded);
        initializeGoogleSignIn();
      }
    }, 100);

    // Cleanup interval on unmount
    return () => clearInterval(checkGoogleLoaded);
  }, [initializeGoogleSignIn]);

  return (
    <div className="flex justify-center">
      <div id="google-signin-button" aria-label="Sign in with Google"></div>
    </div>
  );
}

export default ButtonLoginGoogle;