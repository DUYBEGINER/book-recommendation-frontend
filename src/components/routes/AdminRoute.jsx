import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log("🔍 AdminRoute - User:", user);
  console.log("🔍 AdminRoute - User Role:", user?.role);
  console.log("🔍 AdminRoute - Is Authenticated:", isAuthenticated);
  console.log("🔍 AdminRoute - Loading:", loading);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    console.log("❌ AdminRoute - Not authenticated, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // Check if user has ADMIN role
  const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
  const isAdmin = roleName?.toUpperCase() === 'ADMIN' || user?.isAdmin;
  console.log("🔍 AdminRoute - Is Admin:", isAdmin);

  // Redirect non-admin users to home page (they shouldn't access admin area)
  if (!isAdmin) {
    console.log("⚠️ AdminRoute - Not admin, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // User is admin, render children
  console.log("✅ AdminRoute - Allowing access for ADMIN");
  return children;
};

export default AdminRoute;
