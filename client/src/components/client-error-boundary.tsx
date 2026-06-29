"use client";

import { SilentErrorBoundary } from "@/components/silent-error-boundary";
import type { ReactNode } from "react";

export function ClientErrorBoundary({ children }: { children: ReactNode }) {
  return <SilentErrorBoundary>{children}</SilentErrorBoundary>;
}
