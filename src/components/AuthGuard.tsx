
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user role is not allowed, redirect to appropriate dashboard
  if (!allowedRoles.includes(user.user_type)) {
    if (user.user_type === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.user_type === 'staff') {
      return <Navigate to="/staff-dashboard" replace />;
    } else {
      return <Navigate to="/guest" replace />;
    }
  }

  // If user role is allowed, render the children
  return <>{children}</>;
};

export default AuthGuard;
