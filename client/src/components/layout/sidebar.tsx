"use client";

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
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/questions", icon: FileQuestion, label: "Questions" },
  { href: "/dashboard/flashcards", icon: Library, label: "Flashcards" },
  { href: "/dashboard/exams", icon: GraduationCap, label: "Exams" },
  { href: "/dashboard/courses", icon: BookOpen, label: "Courses" },
  { href: "/dashboard/progress", icon: BarChart3, label: "Progress" },
  { href: "/dashboard/videos", icon: Video, label: "Videos" },
];

const bottomItems = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/dashboard/admin", icon: Shield, label: "Admin" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/admin")) return pathname.startsWith("/admin");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-background via-background to-muted dark:from-slate-900 dark:via-slate-900 dark:to-slate-950",
        "rounded-r-2xl shadow-card",
        "border-r border-border/50",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn(
        "flex h-16 items-center border-b border-border/50",
        isCollapsed ? "justify-center px-0" : "px-5"
      )}>
        <Link href="/" className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-foreground via-blue-500 to-foreground dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
              Hospital EDU
            </span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-1 px-2.5 py-4 scrollbar-thin">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "hover:bg-accent/50 hover:scale-[1.02] active:scale-[0.98]",
                    active
                      ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    isCollapsed && "justify-center px-2 hover:scale-100"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                  )}
                  <item.icon className={cn("h-4.5 w-4.5 flex-shrink-0", active && "drop-shadow-sm")} />
                  {!isCollapsed && <span>{item.label}</span>}
                </span>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4 bg-border/50" />

        <nav className="flex flex-col gap-1">
          {bottomItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "hover:bg-accent/50 hover:scale-[1.02] active:scale-[0.98]",
                    active
                      ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    isCollapsed && "justify-center px-2 hover:scale-100"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                  )}
                  <item.icon className={cn("h-4.5 w-4.5 flex-shrink-0", active && "drop-shadow-sm")} />
                  {!isCollapsed && <span>{item.label}</span>}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-border/50 p-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          className="w-full text-muted-foreground hover:text-foreground hover:bg-accent/50"
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