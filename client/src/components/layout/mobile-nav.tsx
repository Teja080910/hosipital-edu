"use client";

import { usePathname } from "@/routing";
import { Link } from "@/routing";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileQuestion, Library, GraduationCap, BarChart3 } from "lucide-react";

const items = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/questions", icon: FileQuestion, label: "Questions" },
  { href: "/flashcards", icon: Library, label: "Cards" },
  { href: "/exams", icon: GraduationCap, label: "Exams" },
  { href: "/progress", icon: BarChart3, label: "Progress" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === `/${item.href.replace("/", "")}` ||
            (item.href === "/" && pathname === "");
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[10px]",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
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