"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import { Link } from "@/routing";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
      toast.success(t("welcome_back"));
      router.push("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t("invalid_credentials");
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/25">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight">{t("login_title")}</CardTitle>
            <CardDescription className="text-sm mt-1.5">{t("login_subtitle")}</CardDescription>
          </CardHeader>

          <CardContent className="pb-8 px-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                className="space-y-2"
                animate={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.15 }}
              >
                <Label htmlFor="email" className={cn("text-sm font-medium transition-colors duration-200", focusedField === "email" ? "text-primary" : "text-foreground/80")}>
                  {t("email_label")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={cn(
                    "h-11 transition-all duration-200 bg-background/50",
                    focusedField === "email" && "ring-2 ring-primary/20 border-primary shadow-sm shadow-primary/5"
                  )}
                />
              </motion.div>

              <motion.div
                className="space-y-2"
                animate={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className={cn("text-sm font-medium transition-colors duration-200", focusedField === "password" ? "text-primary" : "text-foreground/80")}>
                    {t("password_label")}
                  </Label>
                  <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    {t("forgot_password")}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password_placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={cn(
                      "h-11 pr-10 transition-all duration-200 bg-background/50",
                      focusedField === "password" && "ring-2 ring-primary/20 border-primary shadow-sm shadow-primary/5"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="pt-1"
              >
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 text-sm font-medium text-destructive text-center"
                  >
                    {errorMsg}
                  </motion.p>
                )}
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium transition-all duration-200 active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      {t("signing_in")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {t("login_submit")}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center text-sm"
            >
              <span className="text-muted-foreground">{t("no_account")} </span>
              <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                {t("register_submit")}
              </Link>
            </motion.div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground/60">
          <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> {t("trusted_by")}</span>
          <span className="flex items-center gap-1.5"><GraduationCap className="h-3 w-3" /> {t("exam_prep")}</span>
        </div>
      </motion.div>
    </div>
  );
}