"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { Shell } from "@/components/layout/shell";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}