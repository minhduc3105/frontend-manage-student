"use client";

import type React from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback = <div>Access Denied</div>,
}) => {
  const { isAuthenticated, hasAnyRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chỉ redirect khi loading = false
    console.log(
      "ProtectedRoute: isAuthenticated =",
      isAuthenticated,
      "loading =",
      loading
    );
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Check role
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
