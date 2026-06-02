"use client";

import { useState } from "react";
import { usePathname } from "@/routing";
import { Link } from "@/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileQuestion,
  Library,
  GraduationCap,
  BookOpen,
  BarChart3,
  Video,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/questions", icon: FileQuestion, label: "Questions" },
  { href: "/flashcards", icon: Library, label: "Flashcards" },
  { href: "/exams", icon: GraduationCap, label: "Exams" },
  { href: "/courses", icon: BookOpen, label: "Courses" },
  { href: "/progress", icon: BarChart3, label: "Progress" },
  { href: "/videos", icon: Video, label: "Videos" },
];

const adminItems = [
  { href: "/admin", icon: Shield, label: "Admin" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || (pathname !== "/admin" && !pathname.startsWith("/admin") && navItems.every(i => !pathname.startsWith(i.href) || (i.href === "/" && pathname !== "/")));
    if (href.startsWith("/admin")) return pathname.startsWith("/admin");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card/95 backdrop-blur-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn(
        "flex h-16 items-center border-b px-4",
        isCollapsed && "justify-center px-0"
      )}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-subtle">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight">Hospital EDU</span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-1 px-2.5 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary shadow-subtle"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </span>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" />

        <nav className="flex flex-col gap-1">
          {adminItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary shadow-subtle"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-2.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          className="w-full"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}