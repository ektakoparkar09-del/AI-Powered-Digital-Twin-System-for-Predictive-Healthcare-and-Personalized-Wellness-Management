
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function ProtectedRoute({
  unauthenticatedElement,
}) {
  const {
    isAuthenticated,
    isLoadingAuth,
    authChecked,
  } = useAuth();

  const location = useLocation();

  // Wait until authentication state has been checked
  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />

          <p className="text-sm text-muted-foreground">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  // User is not authenticated
  if (!isAuthenticated) {
    return (
      unauthenticatedElement || (
        <Navigate
          to="/login"
          replace
          state={{
            from: location.pathname,
          }}
        />
      )
    );
  }

  // User is authenticated
  return <Outlet />;
}

