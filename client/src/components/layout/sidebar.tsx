"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/routing";
import { Link } from "@/routing";
import Image from "next/image";
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
  Calendar,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  FileText,
  CreditCard,
  Languages,
  BarChart,
  BookOpenCheck,
  BookOpenText,
  Crown,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { subscriptionsApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

const allNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "dashboard" },
  { href: "/dashboard/questions", icon: FileQuestion, label: "questions", accountTypes: ["full"] },
  { href: "/dashboard/flashcards", icon: Library, label: "flashcards", accountTypes: ["full"] },
  { href: "/dashboard/exams", icon: GraduationCap, label: "exams", accountTypes: ["full"] },
  { href: "/dashboard/courses", icon: BookOpen, label: "courses" },
  { href: "/dashboard/calendar", icon: Calendar, label: "calendar" },
  { href: "/dashboard/progress", icon: BarChart3, label: "progress" },
  { href: "/dashboard/videos", icon: Video, label: "videos", accountTypes: ["full"] },
];

const adminItems = [
  { href: "/dashboard/admin", icon: BarChart, label: "dashboard_title" },
  { href: "/dashboard/admin/courses", icon: BookOpenCheck, label: "course_mgmt_title" },
  { href: "/dashboard/admin/questions", icon: FileQuestion, label: "question_mgmt_title" },
  { href: "/dashboard/admin/articles", icon: FileText, label: "articles_title" },
  { href: "/dashboard/admin/videos", icon: Video, label: "videos_title" },
  { href: "/dashboard/admin/users", icon: Users, label: "user_mgmt_title" },
  { href: "/dashboard/admin/subscriptions", icon: CreditCard, label: "subscription_mgmt_title" },
  { href: "/dashboard/admin/parameters", icon: SlidersHorizontal, label: "parameters_title" },
  { href: "/dashboard/admin/translations", icon: Languages, label: "translations_title" },
  { href: "/dashboard/admin/analytics", icon: BarChart, label: "analytics_title" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isCollapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const sb = useTranslations("sidebar");
  const n = useTranslations("nav");
  const a = useTranslations("admin");
  const sbs = useTranslations("subscribe");
  const { user } = useAuth();
  const pathname = usePathname();
  const [adminOpen, setAdminOpen] = useState(true);
  const navItems = allNavItems.filter(item => {
    if (!item.accountTypes) return true;
    return item.accountTypes.includes(user?.accountType || "full");
  });
  const [subData, setSubData] = useState<{ sub: any; allPlans: any[] } | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") {
      subscriptionsApi.mySubscription().then(({ data }) => {
        if (data) {
          subscriptionsApi.plans().then(({ data: plans }) => {
            setSubData({ sub: data, allPlans: (plans || []).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) });
          });
        }
      }).catch(() => {});
    }
  }, [user]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/admin")) return pathname.startsWith(href);
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/admin") return pathname === "/dashboard/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-background via-background to-muted dark:from-slate-900 dark:via-slate-900 dark:to-slate-950",
        "rounded-r-2xl shadow-card",
        "border-r border-border/50",
        isCollapsed ? "w-16" : "w-64",
        mobileOpen
          ? "translate-x-0"
          : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className={cn(
        "flex h-16 items-center border-b border-border/50",
        isCollapsed ? "justify-center px-0" : "px-5"
      )}>
        <Link href="/" className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <Image src="/logo.png" alt="MD Exams" width={32} height={32} className="rounded-lg" />
          {!isCollapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-foreground via-blue-500 to-foreground dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
              {sb("brand")}
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
                  onClick={onMobileClose}
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
                  {!isCollapsed && <span>{n(item.label)}</span>}
                </span>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4 bg-border/50" />

        {user?.role === "admin" && !isCollapsed && (
          <button
            onClick={() => setAdminOpen(!adminOpen)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
          >
            <Shield className="h-4.5 w-4.5 flex-shrink-0" />
            <span className="flex-1 text-left">{n("admin")}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", adminOpen && "rotate-180")} />
          </button>
        )}

        {user?.role === "admin" && isCollapsed && (
          <Link href="/dashboard/admin">
            <span className="flex items-center justify-center rounded-xl px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-accent/50">
              <Shield className="h-4.5 w-4.5" />
            </span>
          </Link>
        )}

        {user?.role === "admin" && adminOpen && (
          <nav className="flex flex-col gap-1 mt-1">
            {adminItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    onClick={onMobileClose}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                      "hover:bg-accent/30 hover:scale-[1.01] active:scale-[0.98]",
                      active
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>{a(item.label)}</span>}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}

        <Separator className="my-4 bg-border/50" />

        {subData && !isCollapsed && (
          <div className="px-3 space-y-3">
            <Link href="/dashboard/subscribe">
              <span className="block rounded-xl border border-primary/20 bg-primary/5 p-3 hover:bg-primary/10 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold text-foreground">
                    {subData.sub?.plan?.name?.en || sb("active_plan")}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {subData.sub?.plan?.interval} &middot; ${subData.sub?.plan?.price}
                </div>
              </span>
            </Link>
            {subData.allPlans.filter(p => p.sortOrder !== subData.sub?.plan?.sortOrder).length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{sb("other_plans")}</p>
                {subData.allPlans.filter(p => p.sortOrder !== subData.sub?.plan?.sortOrder).map((plan: any) => {
                  const isDowngrade = plan.sortOrder < subData.sub?.plan?.sortOrder;
                  return (
                    <Link key={plan.id} href="/dashboard/subscribe">
                      <span className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-accent/50 transition-colors">
                        <Sparkles className={cn("h-3.5 w-3.5", isDowngrade ? "text-muted-foreground" : "text-primary")} />
                        {(isDowngrade ? sbs("downgrade") : sbs("upgrade"))} to {plan.name?.en || plan.interval} &middot; ${plan.price}/{plan.interval === "year" ? "yr" : plan.interval === "quarter" ? "3mo" : "mo"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {isCollapsed && subData?.allPlans && subData.allPlans.length > 0 && (
          <Link href="/dashboard/subscribe">
            <span className="flex items-center justify-center rounded-xl px-3 py-2.5 text-amber-500 hover:bg-accent/50">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
          </Link>
        )}

        <Separator className="my-4 bg-border/50" />

        <nav className="flex flex-col gap-1">
          <Link href="/dashboard/settings">
            <span
              onClick={onMobileClose}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "hover:bg-accent/50 hover:scale-[1.02] active:scale-[0.98]",
                isActive("/dashboard/settings")
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Settings className="h-4.5 w-4.5 flex-shrink-0" />
              {!isCollapsed && <span>{n("settings")}</span>}
            </span>
          </Link>
          <Link href="/dashboard/guides">
            <span
              onClick={onMobileClose}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "hover:bg-accent/50 hover:scale-[1.02] active:scale-[0.98]",
                isActive("/dashboard/guides")
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              <BookOpenText className="h-4.5 w-4.5 flex-shrink-0" />
              {!isCollapsed && <span>{n("guides")}</span>}
            </span>
          </Link>
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