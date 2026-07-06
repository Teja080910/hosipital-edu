"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionsApi } from "@/lib/api";
import { useRouter, usePathname } from "@/routing";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export function SubscriptionGate({ children }: { children: ReactNode }) {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkRef = useRef<() => Promise<void>>();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "admin" || user.role === "super_admin") {
      setChecking(false);
      return;
    }

    const confirmStripeCheckout = async () => {
      const sessionId = searchParams?.get("session_id");
      if (sessionId) {
        try {
          const { data } = await subscriptionsApi.confirmCheckout(sessionId);
          if (data.status === "active") {
            await refreshUser();
            router.replace(pathname);
            setChecking(false);
            return true;
          }
        } catch {
          // fall through
        }
      }
      return false;
    };

    const checkSubscription = async () => {
      const confirmed = await confirmStripeCheckout();
      if (confirmed) return;

      try {
        const { data } = await subscriptionsApi.mySubscription();
        if (data?.status === "active") {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // no subscription
      } finally {
        setChecking(false);
      }
    };

    checkRef.current = checkSubscription;
    checkSubscription();

    if (searchParams?.has("checkout")) {
      pollRef.current = setInterval(() => checkRef.current?.(), 2000);
      timeoutRef.current = setTimeout(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        setChecking(false);
      }, 15000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, isLoading, router, pathname, searchParams]);

  if (checking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}