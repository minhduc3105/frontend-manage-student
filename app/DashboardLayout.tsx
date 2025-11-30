// src/components/DashboardLayout.tsx
"use client";

import { ReactNode } from "react";
import ProtectedRoute from "../components/ProtectedRoute"; // hoặc đường dẫn phù hợp

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  requiredRoles = [],
}) => {
  return (
    <ProtectedRoute requiredRoles={requiredRoles}>{children}</ProtectedRoute>
  );
};

export default DashboardLayout;
