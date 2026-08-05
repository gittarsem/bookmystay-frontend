import { type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import type { UserRole } from "@/types";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    toast.error("Please login to continue");
    setLocation("/login");
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    setLocation("/403");
    return null;
  }

  return <>{children}</>;
}
