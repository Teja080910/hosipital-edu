"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { Shell } from "@/components/layout/shell";
import { SubscriptionGate } from "@/components/subscription-gate";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionGate>
        <Shell>{children}</Shell>
      </SubscriptionGate>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}