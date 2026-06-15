import Image from "next/image";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function PublicNav() {
  const t = useTranslations("nav");
  const s = useTranslations("sidebar");
  const { theme, setTheme } = useTheme();
  const { user, isLoading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt={s("brand")} width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-bold tracking-tight">{s("brand")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild><Link href="/blog">{t("blog")}</Link></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {!isLoading && user && (
            <Button size="sm" asChild><Link href="/dashboard">{t("dashboard")}</Link></Button>
          )}
        </div>
      </div>
    </nav>
  );
}