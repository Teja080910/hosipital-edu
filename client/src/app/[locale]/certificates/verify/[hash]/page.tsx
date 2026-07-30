"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { certificatesApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
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

export default function VerifyByHashPage() {
  const { hash, locale } = useParams();
  const currentLocale = (locale as string) || "en";
  const t = useTranslations("certificates");
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!hash) return;
    certificatesApi
      .verify(hash as string)
      .then(({ data }) => setCert(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <p className="text-xl font-semibold text-destructive">{t("verify_not_found")}</p>
        <p className="text-muted-foreground">{t("verify_not_found_desc")}</p>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> {t("back")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex items-center justify-center">
      <div className="mx-auto max-w-2xl w-full">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("back")}
            </Link>
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="p-6 md:p-10 text-center bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
            <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 mb-6">
              <CheckCircle2 className="h-8 w-8" />
              <span className="text-lg font-semibold">{t("verify_success")}</span>
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-2">{cert.studentName}</h1>
            <p className="text-muted-foreground mb-4">{t("verify_success_desc")}</p>
            <h2 className="text-2xl font-semibold text-primary mb-8">{localizedText(cert.courseName)}</h2>

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
        </Card>
      </div>
    </div>
  );
}
