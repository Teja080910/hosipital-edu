"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "@/routing";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Mail, Sparkles, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

export default function VerifyEmailPageWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}

function VerifyEmailPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg(t("invalid_verification_token"));
      return;
    }
    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        setStatus("success");
        toast.success(t("email_verified_toast"));
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err?.response?.data?.message || t("verification_failed"));
      }
    };
    verify();
  }, [token, t]);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-500/5 blur-[150px]" />
      </div>

      <motion.div {...fadeUp} className="relative w-full max-w-md">
        <Card className="relative border-border/50 bg-card/80 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-indigo-500" />

          <CardHeader className="text-center pt-10 pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="flex justify-center mb-5"
            >
              {status === "verifying" && (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/25">
                  <Mail className="h-8 w-8 text-white" />
                </div>
              )}
              {status === "success" && (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
              )}
              {status === "error" && (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25">
                  <XCircle className="h-8 w-8 text-white" />
                </div>
              )}
            </motion.div>

            {status === "verifying" && (
              <>
                <CardTitle className="text-2xl font-bold tracking-tight">{t("verifying_email")}</CardTitle>
                <CardDescription className="text-sm mt-1.5">{t("verifying_email_desc")}</CardDescription>
              </>
            )}
            {status === "success" && (
              <>
                <CardTitle className="text-2xl font-bold tracking-tight">{t("email_verified")}</CardTitle>
                <CardDescription className="text-sm mt-1.5">{t("email_verified_desc")}</CardDescription>
              </>
            )}
            {status === "error" && (
              <>
                <CardTitle className="text-2xl font-bold tracking-tight">{t("verification_failed_title")}</CardTitle>
                <CardDescription className="text-sm mt-1.5">{errorMsg || t("verification_failed")}</CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="pb-8 px-7">
            {status === "verifying" && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <Button
                  className="w-full h-11 text-base font-medium transition-all duration-200 active:scale-[0.98]"
                  onClick={() => router.push("/login")}
                >
                  <span className="flex items-center gap-2">
                    {t("go_to_login")}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <Button
                  className="w-full h-11 text-base font-medium"
                  onClick={() => router.push("/login")}
                >
                  {t("back_to_login")}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground/60">
          <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> {t("trusted_by")}</span>
        </div>
      </motion.div>
    </div>
  );
}
