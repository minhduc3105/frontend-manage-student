"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "./contexts/AuthContext";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default function App({ children }: { children?: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
