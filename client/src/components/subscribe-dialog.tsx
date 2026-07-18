"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionsApi } from "@/lib/api";
import { cn, localizedText } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Clock, ArrowRight, Check, Crown, Sparkles } from "lucide-react";

interface SubscribeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  courseId: string;
}

export function SubscribeDialog({ open, onOpenChange, courseTitle, courseId }: SubscribeDialogProps) {
  const t = useTranslations("courses");
  const ts = useTranslations("subscribe");
  const { user } = useAuth();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const hasTrial = user?.targetExamId && user?.createdAt && 
    (Date.now() - new Date(user.createdAt).getTime()) / 3600000 <= 24;

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (open) {
      setLoadingPlans(true);
      subscriptionsApi.plans()
        .then(({ data }) => setPlans((data || []).filter((p: any) => p.id).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))))
        .catch(() => setPlans([]))
        .finally(() => setLoadingPlans(false));
    }
  };

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      const { data } = await subscriptionsApi.createCheckout(planId, locale);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || ts("checkout_failed"));
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{t("subscribe_to_access")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("subscribe_to_course", { course: courseTitle })}
          </DialogDescription>
        </DialogHeader>

        {hasTrial && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-300">
            <Clock className="h-4 w-4 flex-shrink-0" />
            {t("trial_active")}
          </div>
        )}

        {loadingPlans ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{ts("no_plans")}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className={cn(
                "relative flex flex-col border-border/50",
                plan.isPopular && "border-primary shadow-lg scale-105 z-10",
              )}>
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="px-3 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
                      {ts("most_popular")}
                    </Badge>
                  </div>
                )}
                <CardHeader className={cn(plan.isPopular && "pt-6")}>
                  <CardTitle className="text-lg capitalize">{plan.interval}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground ml-1 text-sm">/{plan.interval}</span>
                  </div>
                  {localizedText(plan.description, locale) && (
                    <p className="text-xs text-muted-foreground mt-1">{localizedText(plan.description, locale)}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  {localizedText(plan.name, locale) && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-xs">{localizedText(plan.name, locale)}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.isPopular ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing === plan.id}
                  >
                    {subscribing === plan.id ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : null}
                    {ts("subscribe")}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            {t("maybe_later")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
