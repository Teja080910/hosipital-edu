"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { certificatesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Download, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "@/routing";

interface Certificate {
  id: string;
  certificateNumber: string;
  studentName: string;
  courseName: string | Record<string, string>;
  completionDate: string;
  verificationHash: string;
  qrCodeUrl?: string;
  pdfUrl?: string;
}

function localized(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] || Object.values(obj)[0] || "";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CertificatePage() {
  const { id } = useParams();
  const t = useTranslations("certificates");
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    certificatesApi
      .get(id as string)
      .then(({ data }) => setCert(data))
      .catch(() => setError("Certificate not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || "Certificate not found"}</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 print:bg-white print:p-0">
      <div className="no-print mb-6 flex items-center justify-between max-w-4xl mx-auto">
        <Button variant="ghost" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" /> {t("back")}</Link>
        </Button>
        <Button onClick={handlePrint}><Download className="h-4 w-4 mr-2" /> {t("print")}</Button>
      </div>

      <div className="mx-auto max-w-4xl">
        <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl print:border-0 print:shadow-none">
          <div className="relative bg-gradient-to-br from-primary/5 via-white to-blue-50 dark:from-primary/10 dark:via-background dark:to-blue-950/20 p-8 md:p-16 text-center">
            <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-primary/10 rounded-lg pointer-events-none" />

            <div className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-primary/70">
              Certificate of Completion
            </div>

            <div className="my-8">
              <p className="text-sm text-muted-foreground mb-2">This is to certify that</p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {cert.studentName}
              </h1>
            </div>

            <div className="my-8">
              <p className="text-sm text-muted-foreground mb-2">has successfully completed the course</p>
              <h2 className="text-xl md:text-2xl font-semibold text-primary">
                {localized(cert.courseName)}
              </h2>
            </div>

            <div className="my-8">
              <p className="text-sm text-muted-foreground">Date of Completion</p>
              <p className="text-lg font-medium">{formatDate(cert.completionDate)}</p>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div>
                <p className="font-mono text-xs">{cert.certificateNumber}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-xs">Verification</p>
                <p className="font-mono text-xs">{cert.verificationHash.slice(0, 16)}...</p>
              </div>
            </div>

            <div className="absolute top-6 right-6 text-green-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
          </div>
        </Card>

        <div className="no-print mt-4 text-center text-xs text-muted-foreground">
          <p>Use Ctrl+P / Cmd+P to save as PDF</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
