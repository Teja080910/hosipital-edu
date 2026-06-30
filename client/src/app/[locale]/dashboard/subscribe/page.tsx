"use client";

import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionsApi } from "@/lib/api";
import { cn, localizedText } from "@/lib/utils";
import { useRouter } from "@/routing";
import { motion } from "framer-motion";
import { ArrowRight, Check, Crown, Loader2, Lock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SubscribePage() {
  const t = useTranslations("subscribe");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  useEffect(() => {
    subscriptionsApi.plans()
      .then(({ data }) => {
        setPlans((data || []).filter((p: any) => p.id).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));

    if (user && user.role !== "admin" && user.role !== "super_admin") {
      subscriptionsApi.mySubscription()
        .then(({ data }) => setCurrentSub(data || null))
        .catch(() => {});
    }
  }, [user]);

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      const { data } = await subscriptionsApi.createCheckout(planId, locale);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("checkout_failed"));
    } finally {
      setSubscribing(null);
    }
  };

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const stagger = (i: number) => ({
    ...fadeUp,
    transition: { ...fadeUp.transition, delay: i * 0.08 },
  });

  const currentPlanOrder = currentSub?.plan?.sortOrder ?? -1;
  const isCurrentPlan = (sortOrder: number) => currentSub && currentPlanOrder === sortOrder;

  return (
    <PageTransition>
      <div className="min-h-screen py-16 px-4">
        <motion.div {...fadeUp} className="text-center mb-12 max-w-2xl mx-auto">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">
            <Crown className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {currentSub ? t("badge_with_sub") : t("badge_no_sub")}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {currentSub ? t("manage_title") : t("title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {currentSub
              ? t("description_with_sub", {
                  plan: localizedText(currentSub.plan?.name, locale) || currentSub.plan?.interval || "active",
                })
              : t("description_no_sub")}
          </p>
        </motion.div>

        {currentSub && (
          <motion.div {...fadeUp} className="max-w-xl mx-auto mb-12">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="font-semibold text-lg">{localizedText(currentSub.plan?.name, locale) || t("current_plan")}</p>
                    <p className="text-sm text-muted-foreground">
                      ${currentSub.plan?.price}/{currentSub.plan?.interval} &middot; {currentSub.status}
                    </p>
                  </div>
                </div>
                {currentSub.currentPeriodEnd && (
                  <p className="text-xs text-muted-foreground">
                    {t("renews_on", { date: new Date(currentSub.currentPeriodEnd).toLocaleDateString() })}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : plans.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <Lock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">{t("no_plans")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan, i) => {
              const isCurrent = isCurrentPlan(plan.sortOrder);
              const isDowngrade = currentSub && plan.sortOrder < currentPlanOrder;
              const isUpgrade = currentSub && plan.sortOrder > currentPlanOrder;
              return (
                <motion.div key={plan.id || localizedText(plan.name, locale) || plan.interval} {...stagger(i)} className="flex">
                  <Card className={cn(
                    "relative flex flex-col w-full border-border/50 transition-all duration-300",
                    isCurrent && "border-amber-400/50 shadow-lg shadow-amber-500/10 scale-105 md:scale-105 z-10",
                    !isCurrent && plan.interval === "quarter" && "border-primary shadow-card-hover scale-105 md:scale-105 z-10",
                  )}>
                    {(isCurrent || plan.interval === "quarter") && !isCurrent && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="px-4 py-1 text-xs font-semibold bg-primary text-primary-foreground shadow-subtle">
                          {t("most_popular")}
                        </Badge>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="px-4 py-1 text-xs font-semibold bg-amber-500 text-white shadow-subtle">
                          <Crown className="h-3 w-3 mr-1" /> {t("current_plan")}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className={cn((isCurrent || plan.interval === "quarter") && "pt-8")}>
                      <CardTitle className="text-xl capitalize">{plan.interval}</CardTitle>
                      <div className="mt-3">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground ml-1">/{plan.interval}</span>
                      </div>
                      {localizedText(plan.description, locale) && (
                        <p className="text-sm text-muted-foreground mt-2">{localizedText(plan.description, locale)}</p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1">
                      {localizedText(plan.name, locale) && (
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{localizedText(plan.name, locale)}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {isCurrent ? (
                        <Button className="w-full" variant="secondary" size="lg" disabled>
                          <Check className="mr-2 h-4 w-4" /> {t("active")}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={plan.interval === "quarter" ? "default" : "outline"}
                          size="lg"
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={subscribing === plan.id}
                        >
                          {subscribing === plan.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {currentSub ? (isDowngrade ? t("downgrade") : t("upgrade")) : t("subscribe")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {currentSub && (
          <motion.div {...fadeUp} className="max-w-md mx-auto mt-12 text-center">
            <Separator className="mb-6" />
            <Button variant="outline" size="sm" onClick={async () => {
              try {
                await subscriptionsApi.cancel();
                toast.success(t("cancel_success"));
                router.refresh();
              } catch {
                toast.error(t("cancel_failed"));
              }
            }}>
              {t("cancel")}
            </Button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
