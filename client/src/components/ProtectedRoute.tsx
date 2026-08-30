import {
  useEffect,
  type ReactNode,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { toast } from "sonner";

import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    hasRole,
    loading,
  } = useAuth();

  const [, setLocation] = useLocation();

  useEffect(() => {
    // Wait until AuthContext finishes restoring
    // the authentication state.
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to continue.");
      setLocation("/login");
      return;
    }

    if (
      requiredRole &&
      !hasRole(requiredRole)
    ) {
      toast.error(
        "You don't have permission to access this page."
      );

      setLocation("/403");
    }
  }, [
    loading,
    isAuthenticated,
    requiredRole,
    hasRole,
    setLocation,
  ]);

  // -------------------------------------------------------
  // Loading
  // -------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 rounded-full border-2 border-bronze/20 border-t-bronze animate-spin" />

          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Not authenticated
  // -------------------------------------------------------

  if (!isAuthenticated) {
    return null;
  }

  // -------------------------------------------------------
  // Wrong role
  // -------------------------------------------------------

  if (
    requiredRole &&
    !hasRole(requiredRole)
  ) {
    return null;
  }

  // -------------------------------------------------------
  // Authorized
  // -------------------------------------------------------

  return <>{children}</>;
}