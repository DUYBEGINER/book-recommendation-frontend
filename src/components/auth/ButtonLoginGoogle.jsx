// src/components/auth/ButtonLoginGoogle.jsx
import React, { useEffect, useCallback, useRef } from "react";

function ButtonLoginGoogle() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  const initializedRef = useRef(false);

  const initializeGoogleSignIn = useCallback(() => {
    if (!window.google?.accounts?.id || initializedRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      ux_mode: "redirect",
      login_uri: `${API_BASE_URL}/auth/google`,
    });

    const buttonContainer = document.getElementById("google-signin-button");
    if (buttonContainer) {
      window.google.accounts.id.renderButton(buttonContainer, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        locale: "vi_VN",
        width: 250 // Thiết lập chiều rộng cố định giúp ổn định layout
      });
      initializedRef.current = true;
    }
  }, [GOOGLE_CLIENT_ID, API_BASE_URL]);

  useEffect(() => {
    // Nếu SDK đã sẵn sàng (do đã khai báo script async trong index.html)
    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      // Đợi sự kiện load của script thay vì dùng setInterval
      const script = document.querySelector('script[src*="gsi/client"]');
      if (script) {
        script.addEventListener('load', initializeGoogleSignIn);
      }
    }
    
    return () => {
      const script = document.querySelector('script[src*="gsi/client"]');
      if (script) {
        script.removeEventListener('load', initializeGoogleSignIn);
      }
    };
  }, [initializeGoogleSignIn]);

  return (
    // <div className="flex justify-center items-center min-h-[50px]"> 
    //   {/* min-h-[50px] giữ chỗ cho nút, ngăn form bị nhảy khi nút xuất hiện */}
    //   <div id="google-signin-button"></div>
    // </div>
    <div className="flex justify-center items-center w-full min-h-[44px]"> 
      <div 
        id="google-signin-button" 
        className="w-[250px] min-h-[44px] overflow-hidden flex justify-center"
        style={{ height: '44px' }} // Khóa cứng chiều cao để tránh SDK thay đổi
      ></div>
    </div>
  );
}

export default ButtonLoginGoogle;

// import React, { useEffect, useCallback } from "react";

// /**
//  * Google Sign-In Button Component
//  * 
//  * Uses Google Identity Services (GIS) library for authentication.
//  * Configured in "redirect" mode - redirects to backend OAuth endpoint.
//  * 
//  * Required environment variables:
//  * - VITE_GOOGLE_CLIENT_ID: Google OAuth 2.0 Client ID
//  * - VITE_API_BASE_URL: Backend API base URL
//  * 
//  * @see https://developers.google.com/identity/gsi/web/guides/overview
//  */
// function ButtonLoginGoogle() {
//   // Get configuration from environment
//   const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

//   /**
//    * Initialize Google Identity Services
//    * Called once when component mounts
//    */
//   const initializeGoogleSignIn = useCallback(() => {
//     // Ensure Google SDK is loaded
//     if (!window.google?.accounts?.id) {
//       console.error('Google Identity Services SDK not loaded');
//       return;
//     }

//     // Validate configuration
//     if (!GOOGLE_CLIENT_ID) {
//       console.error('VITE_GOOGLE_CLIENT_ID environment variable is not set');
//       return;
//     }

//     // Initialize Google Sign-In
//     window.google.accounts.id.initialize({
//       client_id: GOOGLE_CLIENT_ID,
//       ux_mode: "redirect",
//       login_uri: `${API_BASE_URL}/auth/google`,
//     });

//     // Render the sign-in button
//     const buttonContainer = document.getElementById("google-signin-button");
//     if (buttonContainer) {
//       window.google.accounts.id.renderButton(buttonContainer, {
//         theme: "outline",
//         size: "large",
//         shape: "pill",
//         text: "signin_with",
//         locale: "vi_VN",
//       });
//     }
//   }, [GOOGLE_CLIENT_ID, API_BASE_URL]);

//   useEffect(() => {
//     // Check if SDK is already loaded
//     if (window.google?.accounts?.id) {
//       initializeGoogleSignIn();
//       return;
//     }

//     // Wait for SDK to load (it's loaded via script tag in index.html)
//     const checkGoogleLoaded = setInterval(() => {
//       if (window.google?.accounts?.id) {
//         clearInterval(checkGoogleLoaded);
//         initializeGoogleSignIn();
//       }
//     }, 100);

//     // Cleanup interval on unmount
//     return () => clearInterval(checkGoogleLoaded);
//   }, [initializeGoogleSignIn]);

//   return (
//     <div className="flex justify-center">
//       <div id="google-signin-button" aria-label="Sign in with Google"></div>
//     </div>
//   );
// }

// export default ButtonLoginGoogle;