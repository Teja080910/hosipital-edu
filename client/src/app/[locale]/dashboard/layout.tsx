"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthProvider } from "@/providers/auth-provider";
import { Shell } from "@/components/layout/shell";
import { SubscriptionGate } from "@/components/subscription-gate";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

function DashboardShell({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const isExamMode = searchParams.get("mode") === "exam";
  return <Shell fullscreen={isExamMode}>{children}</Shell>;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionGate>
        <Suspense fallback={<Shell>{children}</Shell>}>
          <DashboardShell>{children}</DashboardShell>
        </Suspense>
      </SubscriptionGate>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}