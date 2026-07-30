"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { certificatesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, CheckCircle2, XCircle, ArrowLeft, BookOpen, GraduationCap, Share2, Globe } from "lucide-react";
import { Link } from "@/routing";

interface Certificate {
  id: string;
  certificateNumber: string;
  studentName: string;
  courseName: string | Record<string, string>;
  completionDate: string;
  verificationHash: string;
}

function localizedText(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || Object.values(obj)[0] || "";
}

function formatDate(dateStr: string, locale = "en") {
  return new Date(dateStr).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function VerifyCertificatePage() {
  const { locale } = useParams();
  const currentLocale = (locale as string) || "en";
  const t = useTranslations("certificates");
  const [certNumber, setCertNumber] = useState("");
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim()) return;
    setLoading(true);
    setError(null);
    setCert(null);
    setSearched(true);
    try {
      const { data } = await certificatesApi.findByNumber(certNumber.trim());
      setCert(data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError("not_found");
      } else {
        setError("error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("back")}
            </Link>
          </Button>
        </div>

        <Card className="p-6 md:p-10">
          <div className="text-center mb-8">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold tracking-tight">{t("verify_title")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("verify_subtitle")}
            </p>
          </div>

          <form onSubmit={handleVerify} className="flex gap-3 mb-8">
            <Input
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              placeholder={t("verify_placeholder")}
              className="h-12 flex-1 font-mono text-sm"
            />
            <Button type="submit" size="lg" className="h-12 shrink-0" disabled={loading || !certNumber.trim()}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              {t("verify_button")}
            </Button>
          </form>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && searched && !loading && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-medium text-destructive">{t("verify_not_found")}</p>
              <p className="text-muted-foreground mt-1">
                {t("verify_not_found_desc")}
              </p>
            </div>
          )}

          {cert && !loading && (
            <div className="border rounded-xl p-6 md:p-8 text-center bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
              <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 mb-4">
                <CheckCircle2 className="h-6 w-6" />
                <span className="font-semibold">{t("verify_success")}</span>
              </div>

              <h2 className="text-3xl font-bold text-foreground mb-1">{cert.studentName}</h2>
              <p className="text-muted-foreground mb-4">{t("verify_success_desc")}</p>
              <h3 className="text-xl font-semibold text-primary mb-6">{localizedText(cert.courseName)}</h3>

              <div className="flex justify-center gap-8 text-sm text-muted-foreground mb-6">
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1">{t("verify_date")}</p>
                  <p className="font-medium text-foreground">{formatDate(cert.completionDate, currentLocale)}</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1">{t("verify_cert_no")}</p>
                  <p className="font-mono font-medium text-foreground">{cert.certificateNumber}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 md:p-10 mt-6">
          <h2 className="text-lg font-bold tracking-tight mb-4">{t("how_it_works")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("how_step1_title")}</p>
                <p className="text-xs text-muted-foreground">{t("how_step1_desc")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("how_step2_title")}</p>
                <p className="text-xs text-muted-foreground">{t("how_step2_desc")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Share2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("how_step3_title")}</p>
                <p className="text-xs text-muted-foreground">{t("how_step3_desc")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("how_step4_title")}</p>
                <p className="text-xs text-muted-foreground">{t("how_step4_desc")}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
