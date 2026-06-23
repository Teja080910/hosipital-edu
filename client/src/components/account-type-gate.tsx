"use client";

import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "@/routing";
import { Loader2 } from "lucide-react";

export function AccountTypeGate({ children, allowedTypes = ["full"] }: { children: ReactNode; allowedTypes?: string[] }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "admin" || user.role === "super_admin") return;
    if (!allowedTypes.includes(user.accountType || "full")) {
      router.replace("/dashboard/courses");
    }
  }, [user, isLoading, router, allowedTypes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;
  if (user.role !== "admin" && user.role !== "super_admin" && !allowedTypes.includes(user.accountType || "full")) return null;

  return <>{children}</>;
}
