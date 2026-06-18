"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "@/routing";
import {
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  Menu,
  ChevronDown,
  Moon,
  Sun,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const tb = useTranslations("topbar");
  const c = useTranslations("common");
  const sb = useTranslations("sidebar");
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await logout();
  }, [logout]);
  const router = useRouter();
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);

const currentLocale = useParams().locale as string;

  const switchLocale = (locale: string) => {
    window.location.assign(window.location.pathname.replace(/^\/(en|es)/, `/${locale}`));
  };

  return (
    <header className="sticky top-0 right-0 z-20 flex h-16 items-center gap-4 border-b border-border/50 bg-background/60 backdrop-blur-xl px-4 lg:px-6 transition-all duration-300">
      <div className="flex items-center gap-3 lg:hidden">
        <Button variant="ghost" size="icon-sm" onClick={onMenuClick} className="text-foreground/70 hover:text-foreground">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
          <span className="text-[10px] font-bold text-white">{sb("brand_initials")}</span>
        </div>
      </div>

      <div className={cn(
        "hidden md:flex items-center gap-2 flex-1 max-w-md transition-all duration-200",
        searchFocused && "scale-[1.02]"
      )}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tb("search")}
            className={cn(
              "h-9 pl-9 bg-muted/40 border-border/50 transition-all duration-200",
              "placeholder:text-muted-foreground/60",
              searchFocused && "bg-background border-primary/30 shadow-sm shadow-primary/5"
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div className="flex items-center gap-0.5 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-foreground/60 hover:text-foreground hover:bg-accent/50">
              <Languages className="h-4.5 w-4.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-lg mt-1 min-w-[130px]">
            <DropdownMenuItem onSelect={() => switchLocale("en")} className="rounded-lg" disabled={currentLocale === "en"}>
              🇺🇸 {c("en")} {currentLocale === "en" && <span className="ml-auto text-xs text-primary">{c("active")}</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => switchLocale("es")} className="rounded-lg" disabled={currentLocale === "es"}>
              🇪🇸 {c("es")} {currentLocale === "es" && <span className="ml-auto text-xs text-primary">{c("active")}</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-foreground/60 hover:text-foreground hover:bg-accent/50"
        >
          {theme === "dark" ? (
            <Sun className="h-4.5 w-4.5" />
          ) : (
            <Moon className="h-4.5 w-4.5" />
          )}
        </Button>

        <Button variant="ghost" size="icon-sm" className="text-foreground/60 hover:text-foreground hover:bg-accent/50 relative">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-background" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2.5 px-2.5 ml-2 hover:bg-accent/50 rounded-xl">
              <Avatar className="h-7 w-7 ring-2 ring-border/50">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">
                {user?.name || tb("user")}
              </span>
              <ChevronDown className="h-3 w-3 text-foreground/40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 animate-scale-in rounded-xl border-border/50 shadow-lg mt-1">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name || tb("user")}</span>
                <span className="text-xs text-muted-foreground font-normal mt-0.5">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
<DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="rounded-lg">
               <User className="h-4 w-4 mr-2" />
               {tb("profile")}
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="rounded-lg">
              <Settings className="h-4 w-4 mr-2" />
              {tb("settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="text-destructive focus:text-destructive rounded-lg">
              {loggingOut ? <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-destructive border-t-transparent" /> : <LogOut className="h-4 w-4 mr-2" />}
              {tb("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}