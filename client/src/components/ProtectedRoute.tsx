import {
  useEffect,
  type ReactNode,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

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
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    if (
      requiredRole &&
      !hasRole(requiredRole)
    ) {
      setLocation("/403");
    }
  }, [
    loading,
    isAuthenticated,
    requiredRole,
    hasRole,
    setLocation,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-bronze/20 border-t-bronze" />

          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (
    requiredRole &&
    !hasRole(requiredRole)
  ) {
    return null;
  }

  return <>{children}</>;
}