"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionsApi } from "@/lib/api";
import { useRouter, usePathname } from "@/routing";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export function SubscriptionGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
            const url = pathname.replace("?checkout=success", "").replace(`&session_id=${sessionId}`, "").replace(`?session_id=${sessionId}`, "");
            router.replace(url);
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

      subscriptionsApi.mySubscription()
        .then(({ data }) => {
          if (data?.status === "active") {
            if (pollRef.current) clearInterval(pollRef.current);
          }
          setChecking(false);
        })
        .catch(() => setChecking(false));
    };

    checkSubscription();

    if (pathname.includes("checkout=success")) {
      pollRef.current = setInterval(checkSubscription, 2000);
      setTimeout(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        setChecking(false);
      }, 15000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
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