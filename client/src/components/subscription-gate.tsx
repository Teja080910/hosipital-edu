"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionsApi } from "@/lib/api";
import { useRouter, usePathname } from "@/routing";
import { Loader2 } from "lucide-react";

export function SubscriptionGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "admin") {
      setHasAccess(true);
      setChecking(false);
      return;
    }
    if (pathname.includes("/dashboard/subscribe")) {
      setHasAccess(true);
      setChecking(false);
      return;
    }

    const checkSubscription = () => {
      subscriptionsApi.mySubscription()
        .then(({ data }) => {
          if (data?.status === "active") {
            setHasAccess(true);
            setChecking(false);
            if (pollRef.current) clearInterval(pollRef.current);
          } else if (!pathname.includes("checkout=success")) {
            router.replace("/dashboard/subscribe");
            setChecking(false);
          }
        })
        .catch(() => {
          if (!pathname.includes("checkout=success")) {
            router.replace("/dashboard/subscribe");
            setChecking(false);
          }
        });
    };

    checkSubscription();

    if (pathname.includes("checkout=success")) {
      pollRef.current = setInterval(checkSubscription, 2000);
      setTimeout(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        router.replace("/dashboard/subscribe");
      }, 15000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user, isLoading, router, pathname]);

  if (checking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) return null;

  return <>{children}</>;
}