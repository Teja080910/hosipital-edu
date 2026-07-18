"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LoadingProps {
  className?: string;
  text?: string;
}

export function Loading({ className, text }: LoadingProps) {
  const t = useTranslations("common");
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      {(text !== undefined) ? <p className="text-sm text-muted-foreground">{text}</p> : <p className="text-sm text-muted-foreground">{t("loading")}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-subtle">
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
      <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-muted" />
    </div>
  );
}