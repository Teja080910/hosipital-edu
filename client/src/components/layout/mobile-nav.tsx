"use client";

import { usePathname } from "@/routing";
import { Link } from "@/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LayoutDashboard, FileQuestion, Library, GraduationCap, BarChart3 } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const items = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/dashboard/questions", icon: FileQuestion, label: t("questions") },
    { href: "/dashboard/flashcards", icon: Library, label: t("flashcards") },
    { href: "/dashboard/exams", icon: GraduationCap, label: t("exams") },
    { href: "/dashboard/progress", icon: BarChart3, label: t("progress") },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
              <item.icon
                className={cn(
                  "h-5 w-5",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[10px]",
                  active ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}