"use client";

import { useRef, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/routing";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Sparkles, Eye, EyeOff, Check, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <RegisterPage />
    </Suspense>
  );
}

function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const referralCode = searchParams.get("ref") || undefined;

  const passwordChecks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    match: confirmPassword.length > 0 && password === confirmPassword,
  };

  const isValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (password !== confirmPassword) {
      toast.error(t("passwords_mismatch"));
      return;
    }
    submittingRef.current = true;
    setLoading(true);
    setErrorMsg(null);
    try {
      await register(name, email, password, referralCode);
      toast.success(t("account_created"));
      setLoading(false);
      router.push("/dashboard");
    } catch (error) {
      const message = (error as any)?.response?.data?.message;
      if (Array.isArray(message)) {
        setErrorMsg(message.join(", "));
      } else {
        setErrorMsg(message || t("registration_failed"));
      }
      setLoading(false);
      submittingRef.current = false;
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
            <CardTitle className="text-2xl font-bold tracking-tight">{t("register_title")}</CardTitle>
            <CardDescription className="text-sm mt-1.5">{t("register_subtitle")}</CardDescription>
          </CardHeader>

          <CardContent className="pb-8 px-7">
            <form onSubmit={handleSubmit} className="space-y-4.5">
              <motion.div
                className="space-y-2"
                animate={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.15 }}
              >
                <Label htmlFor="name" className={cn("text-sm font-medium transition-colors duration-200", focusedField === "name" ? "text-primary" : "text-foreground/80")}>
                  {t("name_label")}
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder={t("name_placeholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={cn(
                      "h-11 transition-all duration-200 bg-background/50",
                      focusedField === "name" && "ring-2 ring-primary/20 border-primary shadow-sm shadow-primary/5"
                    )}
                  />
                </div>
              </motion.div>

              <motion.div
                className="space-y-2"
                animate={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="email" className={cn("text-sm font-medium transition-colors duration-200", focusedField === "email" ? "text-primary" : "text-foreground/80")}>
                  {t("email_label")}
                </Label>
                <div className="relative">
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
                </div>
              </motion.div>

              <motion.div
                className="space-y-2"
                animate={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.25 }}
              >
                <Label htmlFor="password" className={cn("text-sm font-medium transition-colors duration-200", focusedField === "password" ? "text-primary" : "text-foreground/80")}>
                  {t("password_label")}
                </Label>
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
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1.5 pt-1"
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      {passwordChecks.length ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-destructive" />}
                      <span className={passwordChecks.length ? "text-green-500" : "text-muted-foreground"}>{t("min_chars")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      {passwordChecks.hasUpper ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-destructive" />}
                      <span className={passwordChecks.hasUpper ? "text-green-500" : "text-muted-foreground"}>{t("one_uppercase")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      {passwordChecks.hasNumber ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-destructive" />}
                      <span className={passwordChecks.hasNumber ? "text-green-500" : "text-muted-foreground"}>{t("one_number")}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                className="space-y-2"
                animate={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="confirmPassword" className={cn("text-sm font-medium transition-colors duration-200", focusedField === "confirm" ? "text-primary" : "text-foreground/80")}>
                  {t("confirm_password")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder={t("password_placeholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField("confirm")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={cn(
                      "h-11 pr-10 transition-all duration-200 bg-background/50",
                      focusedField === "confirm" && "ring-2 ring-primary/20 border-primary shadow-sm shadow-primary/5"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium transition-all duration-200 active:scale-[0.98]"
                  disabled={loading || !isValid}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      {t("creating_account")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {t("register_submit")}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive text-center mt-2"
                >
                  {errorMsg}
                </motion.p>
              )}
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center text-sm text-muted-foreground"
            >
              {t("has_account")}{" "}
              <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                {t("login_submit")}
              </Link>
            </motion.div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground/60">
          <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> {t("free_trial")}</span>
          <span className="flex items-center gap-1.5"><Check className="h-3 w-3" /> {t("no_credit_card")}</span>
          <span className="flex items-center gap-1.5"><X className="h-3 w-3" /> {t("cancel_anytime")}</span>
        </div>
      </motion.div>
    </div>
  );
}