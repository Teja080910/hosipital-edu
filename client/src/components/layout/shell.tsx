"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";
import { useExamStore } from "@/store/exam-store";

export function Shell({ children, fullscreen }: { children: ReactNode; fullscreen?: boolean }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isExamActive = useExamStore((s) => s.isActive);
  const hideNav = fullscreen || isExamActive;

  return (
    <div className="min-h-screen bg-background">
      {!hideNav && (
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      )}

      {!hideNav && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          hideNav ? "" : sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {!hideNav && <Topbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />}
        <main className={cn(
          "min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 pb-20 lg:pb-8",
          hideNav && "min-h-screen p-0"
        )}>
          {children}
        </main>
      </div>

      {!hideNav && <MobileNav />}
    </div>
  );
}