"use client";

import { TypewriterText } from "@/components/typewriter-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/routing";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  Check,
  ChevronDown,
  Crown,
  Facebook,
  Instagram,
  Languages,
  Library,
  Menu,
  Moon,
  Sparkles,
  Star,
  Sun,
  Twitter,
  Video,
  Youtube
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: "-50px" },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
};

const stagger = (i: number) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay: i * 0.08 },
});

export default function LandingPage() {
  const t = useTranslations("landing");
const sb = useTranslations("subscribe");
  const a = useTranslations("auth");
  const n = useTranslations("nav");
  const c = useTranslations("common");

  const features = Array.from({ length: 6 }, (_, i) => ({
    icon: [BookOpen, Brain, Video, Library, BarChart3, Calendar][i],
    title: t(`feature_${i}_title`),
    desc: t(`feature_${i}_desc`),
  }));

  const testimonials = Array.from({ length: 3 }, (_, i) => ({
    name: t(`testimonial_${i}_name`),
    role: t(`testimonial_${i}_role`),
    text: t(`testimonial_${i}_text`),
  }));

  const planFeatures: Record<string, string[]> = {
    monthly: Array.from({ length: 4 }, (_, i) => t(`plan_monthly_${i}`)),
    quarterly: Array.from({ length: 5 }, (_, i) => t(`plan_quarterly_${i}`)),
    annual: Array.from({ length: 5 }, (_, i) => t(`plan_annual_${i}`)),
  };

  const faqs = Array.from({ length: 4 }, (_, i) => ({
    q: t(`faq_${i}_q`),
    a: t(`faq_${i}_a`),
  }));

  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const currentLocale = useParams().locale as string;
  const { user, isLoading, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await logout();
  }, [logout]);
  const [subData, setSubData] = useState<{ planSortOrder: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    subscriptionsApi.plans().then(({ data }) => {
      if (Array.isArray(data)) {
        setPlans(data.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user && user.role !== "admin") {
      subscriptionsApi.mySubscription().then(({ data }) => {
        if (data?.plan?.sortOrder !== undefined && data?.plan?.sortOrder !== null) {
          setSubData({ planSortOrder: data.plan.sortOrder });
        }
      }).catch(() => {});
    }
  }, [user]);

  const getPlanButton = (plan: any) => {
    const isPopular = plan.sortOrder === 1;
    if (!user) {
      return (
        <Link href="/register" className="w-full">
          <Button className="w-full" variant={isPopular ? "default" : "outline"} size="lg">
            {t("get_started")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      );
    }
    if (!subData) {
      return (
        <Link href="/dashboard/subscribe" className="w-full">
          <Button className="w-full" variant={isPopular ? "default" : "outline"} size="lg">
            {sb("subscribe")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      );
    }
    const currentOrder = subData.planSortOrder;
    if (currentOrder === plan.sortOrder) {
      return (
        <Button className="w-full" variant="secondary" size="lg" disabled>
          <Crown className="mr-2 h-4 w-4 text-amber-500" />
          {sb("current_plan")}
        </Button>
      );
    }
    const isDowngrade = plan.sortOrder < currentOrder;
    return (
      <Link href="/dashboard/subscribe" className="w-full">
        <Button className="w-full" variant={isPopular ? "default" : "outline"} size="lg">
          {isDowngrade ? sb("downgrade") : sb("upgrade")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    );
  };
  const switchLocale = (locale: string) => {
    window.location.assign(window.location.pathname.replace(/^\/(en|es)/, `/${locale}`));
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-transparent bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt={t("brand")} width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">{t("brand")}</span>
          </Link>
          <div className="flex items-center gap-1">
            {!isMobile ? (
              /* Desktop nav */
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                      <Languages className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[130px] rounded-xl border-border/50 shadow-lg">
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
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {mounted && (resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
                </Button>

                <div className="flex items-center gap-2 ml-2 border-l border-border/50 pl-3">
                  {isLoading ? null : user ? (
                    <>
                    <Link href="/dashboard">
                      <Button size="sm" className="text-sm shadow-subtle">
                        {n("dashboard")}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut} className="text-sm text-muted-foreground">
                      {loggingOut ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" /> : a("logout")}
                    </Button>
                    </>
                  ) : (
                    <><Link href="/login">
                      <Button variant="ghost" size="sm" className="text-sm">{a("login_submit")}</Button>
                    </Link>
                      <Link href="/register">
                        <Button size="sm" className="text-sm shadow-subtle">
                          {t("get_started")}
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </Link></>
                  )}
                </div>
              </div>
            ) : (
              /* Mobile hamburger */
              <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50 shadow-lg">
                  <DropdownMenuItem onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="rounded-lg">
                    {mounted && (resolvedTheme === "dark" ? <><Sun className="h-4 w-4 mr-2" /> Light mode</> : <><Moon className="h-4 w-4 mr-2" /> Dark mode</>)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => switchLocale("en")} className="rounded-lg" disabled={currentLocale === "en"}>
                    🇺🇸 {c("en")} {currentLocale === "en" && <span className="ml-auto text-xs text-primary">{c("active")}</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => switchLocale("es")} className="rounded-lg" disabled={currentLocale === "es"}>
                    🇪🇸 {c("es")} {currentLocale === "es" && <span className="ml-auto text-xs text-primary">{c("active")}</span>}
                  </DropdownMenuItem>
                  {isLoading ? null : user ? (
                    <>
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          {n("dashboard")}
                          <ArrowRight className="ml-auto h-3.5 w-3.5" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleLogout} disabled={loggingOut} className="rounded-lg text-destructive">
                        {loggingOut ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent mr-2" /> : null}
                        {a("logout")}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>{a("login_submit")}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>{t("get_started")}</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-1.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }}
              className="mb-8"
            >
              <Image src="/logo.png" alt={t("brand")} width={80} height={80} className="mx-auto rounded-2xl shadow-xl" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium animate-fade-in">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                {t("trusted_badge")}
              </Badge>
            </motion.div>

            <div className="min-h-[5rem] sm:min-h-[7rem] flex items-center justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] as const }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 min-h-[3.5rem] sm:min-h-[4.5rem] md:min-h-[5rem] lg:min-h-[6rem]"
              >
                <TypewriterText
                  parts={[
                    { text: t("hero_heading_1"), className: "bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent" },
                    { text: " " + t("hero_heading_2") + " " + t("hero_heading_3") + " " + t("hero_heading_4") },
                  ]}
                  speed={60}
                  deleteSpeed={25}
                  pauseEnd={2500}
                  pauseStart={1000}
                />
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }}
              className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
            >
              {t("hero_subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href={user ? "/dashboard" : "/register"}>
                <Button size="xl" className="text-base shadow-heavy hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  {user ? n("dashboard") : t("start_trial")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="xl" className="text-base hover:shadow-subtle hover:-translate-y-0.5 transition-all duration-200">
                  {t("see_how")}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              {["ENURM", "ENARM", "MIR", "USMLE Step 1", "USMLE Step 2 CK", "CURSOS"].map((exam) => (
                <div key={exam} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span>{exam}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Platform Showcase */}
      {/* <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-primary/[0.01] to-transparent" />
        <div className="absolute top-40 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover={{ y: -4, scale: 1.005 }}
            className="group relative mt-8 max-w-3xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image
              src="/hero-3.jpg"
              alt="MD Exams Study Interface"
              width={800}
              height={534}
              className="w-full h-auto rounded-xl border border-border/50 shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500 relative"
            />
          </motion.div>
        </div>
      </section> */}

      {/* Features */}
      <section id="features" className="relative py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">{t("everything_need")}</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t("features_title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("features_subtitle")}
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div key={feature.title} {...stagger(i)}>
                <Card className="group h-full border border-border/50 hover:border-primary/30 transition-all duration-300">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
                    <CardDescription className="mt-2 text-base leading-relaxed">
                      {feature.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <Image src="/hero-3.jpg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-background/65 backdrop-blur-[2px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">{t("testimonials_title")}</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t("testimonials_title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("testimonials_subtitle")}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <motion.div key={item.name} {...stagger(i)}>
                <Card className="h-full border border-border/50 group transition-all duration-300">
                  <CardContent className="pt-8">
                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-6 italic">
                      &ldquo;{item.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {item.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-primary/[0.02]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">{t("pricing_title")}</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t("pricing_title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("pricing_subtitle")}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan, i) => {
              const pName = plan.name?.en || plan.name;
              const pPopular = plan.sortOrder === 1;
              const pPeriod = plan.interval === "year" ? t("period_year") : plan.interval === "quarter" ? t("period_quarter") : t("period_month");
              const features = planFeatures[plan.interval] || ["Full question bank access", "Basic analytics"];
              return (
              <motion.div key={plan.id || pName} {...stagger(i)}>
                <Card className={cn(
                  "relative h-full flex flex-col border-border/50 transition-all duration-300",
                  pPopular && "border-primary shadow-card-hover scale-105 md:scale-105 z-10",
                )}>
                  {pPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="px-4 py-1 text-xs font-semibold bg-primary text-primary-foreground shadow-subtle">
                        {t("most_popular")}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className={cn(pPopular && "pt-8")}>
                    <CardTitle className="text-xl">{pName}</CardTitle>
                    <div className="mt-3">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground ml-1">{pPeriod}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    {features.map((f) => (
                      <div key={f} className="flex items-start gap-3">
                        <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span className="text-sm">{f}</span>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    {getPlanButton({ ...plan, popular: pPopular })}
                  </CardFooter>
                </Card>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <motion.div {...fadeUp} className="text-center lg:text-left mb-16">
                <Badge variant="secondary" className="mb-4">{t("faq")}</Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  {t("faq_title")}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {t("faq_subtitle")}
                </p>
              </motion.div>

              <div className="space-y-3 max-w-3xl">
                {faqs.map((item, i) => (
                  <motion.div key={i} {...stagger(i)}>
                    <Collapsible>
                      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl border border-border/50 bg-card p-5 text-left font-medium hover:shadow-subtle transition-all duration-200 [&[data-state=open]>svg]:rotate-180">
                        <span>{item.q}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:text-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="px-5 py-4 text-sm text-muted-foreground leading-relaxed border-x border-b border-border/50 rounded-b-xl bg-card/50">
                          {item.a}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Image
                  src="/hero-2.jpg"
                  alt="MD Exams Mobile View"
                  width={900}
                  height={1280}
                  className="w-[450px] max-w-[450px] h-[550px] rounded-xl border border-border/50 shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500 relative mx-auto"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <Badge variant="secondary" className="mb-4">{t("start_trial")}</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t("cta_title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("cta_subtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={user ? "/dashboard" : "/register"}>
                <Button size="xl" className="text-base shadow-heavy hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 bg-primary">
                  {user ? n("dashboard") : t("start_trial")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="xl" className="text-base hover:shadow-subtle transition-all duration-200">
                  {t("talk_to_sales")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt={t("brand")} width={28} height={28} className="rounded-lg" />
              <span className="font-semibold">{t("brand")}</span>
            </Link>
            <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-6">
              <Link href="/blog" className="hover:text-foreground transition-colors">{t("blog")}</Link>
              <Link href="/content/terms" className="hover:text-foreground transition-colors">{t("terms")}</Link>
              <Link href="/content/privacy" className="hover:text-foreground transition-colors">{t("privacy")}</Link>
              <Link href="/content/faq" className="hover:text-foreground transition-colors">{t("faq_title")}</Link>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com/mdexams" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/mdexams" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/mdexams" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://youtube.com/@mdexams" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("copyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}