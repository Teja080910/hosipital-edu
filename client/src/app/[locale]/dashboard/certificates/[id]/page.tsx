"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { certificatesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Download, ArrowLeft, CheckCircle2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Link } from "@/routing";
import { localizedText as localized } from "@/lib/utils";

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

function localizedText(obj: Record<string, string> | string | null | undefined, locale = "en"): string {
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
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    certificatesApi
      .get(id as string)
      .then(({ data }) => setCert(data))
      .catch(() => setError(t("not_found_error")))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    if (!cert) return;
    setDownloading(true);
    try {
      const html = `
        <div style="width:1200px;height:700px;background:#ffffff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-family:system-ui,-apple-system,sans-serif;position:relative;padding:40px 70px;box-sizing:border-box;">
          <div style="position:absolute;top:12px;left:12px;right:12px;bottom:12px;border:3px double #2563eb;border-radius:4px;pointer-events:none;"></div>
          <div style="position:absolute;top:20px;left:20px;right:20px;bottom:20px;border:1px solid #93c5fd;border-radius:2px;pointer-events:none;"></div>
          <div style="position:absolute;top:28px;left:28px;right:28px;bottom:28px;border:1px solid #dbeafe;pointer-events:none;"></div>

          <div style="position:absolute;top:40px;right:40px;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#22c55e" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>

          <img src="${window.location.origin}/logo.png" style="width:50px;height:50px;border-radius:8px;object-fit:cover;border:2px solid #e2e8f0;margin-bottom:6px;" crossorigin="anonymous" />

          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.3em;color:#64748b;margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">${t("certificate_of_completion")}</div>

          <p style="font-size:13px;color:#94a3b8;margin:0 0 6px 0;letter-spacing:0.05em;">${t("this_is_to_certify")}</p>

          <div style="margin:8px 0 16px 0;">
            <div style="font-size:48px;font-weight:900;color:#0f172a;line-height:1.2;">${cert.studentName}</div>
          </div>

          <p style="font-size:13px;color:#94a3b8;margin:20px 0 6px 0;letter-spacing:0.05em;">${t("has_completed")}</p>

          <h2 style="font-size:24px;font-weight:700;color:#2563eb;max-width:700px;text-align:center;margin:0;">${localizedText(cert.courseName)}</h2>

          <div style="margin:24px 0 16px 0;padding:10px 28px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
            <p style="font-size:11px;color:#94a3b8;margin:0 0 3px 0;text-transform:uppercase;letter-spacing:0.1em;">${t("date_of_completion")}</p>
            <p style="font-size:17px;font-weight:600;color:#1e293b;margin:0;">${formatDate(cert.completionDate)}</p>
          </div>

          <div style="display:flex;align-items:center;justify-content:center;gap:40px;font-size:13px;color:#64748b;margin-top:12px;">
            <div style="text-align:center;">
              <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 3px 0;">${t("certificate_no")}</p>
              <p style="font-family:monospace;font-size:12px;color:#334155;margin:0;">${cert.certificateNumber}</p>
            </div>
            <div style="height:32px;width:1px;background:#cbd5e1;"></div>
            <div style="text-align:center;">
              <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 3px 0;">${t("verification_label")}</p>
              <p style="font-family:monospace;font-size:12px;color:#334155;margin:0;">${cert.verificationHash.slice(0, 16)}...</p>
            </div>
          </div>
        </div>`;

      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      wrapper.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;background:#fff;";
      document.body.appendChild(wrapper);

      const target = wrapper.firstElementChild as HTMLElement;
      const canvas = await html2canvas(target, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(wrapper);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pw, ph);
      pdf.save(`certificate-${cert.certificateNumber || id}.pdf`);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setDownloading(false);
    }
  };

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
        <p className="text-muted-foreground">{error || t("not_found_error")}</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_dashboard")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="no-print mb-4 flex items-center justify-between max-w-5xl mx-auto">
        <Button variant="ghost" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" /> {t("back")}</Link>
        </Button>
        <Button onClick={handleDownload} disabled={downloading}>
          {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          {t("download_pdf")}
        </Button>
      </div>

      <div className="mx-auto max-w-4xl">
        <Card className="overflow-hidden shadow-2xl print:border-0 print:shadow-none" style={{ border: "2px solid rgba(59,130,246,0.2)" }}>
          <div className="relative p-8 md:p-16 text-center" style={{ background: "linear-gradient(to bottom right, #f0f4ff, #ffffff, #eff6ff)" }}>
            <div className="absolute top-4 left-4 right-4 bottom-4 rounded-lg pointer-events-none" style={{ border: "2px solid rgba(59,130,246,0.1)" }} />

            <div className="flex flex-col items-center relative z-10">
              <img src="/logo.png" alt="MD Exam" className="w-[50px] h-[50px] rounded-lg object-cover mb-1" />
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">{t("certificate_of_completion")}</div>
            </div>

<div className="flex-1 flex flex-col items-center justify-evenly py-8 px-16 relative z-10 text-center">              <p className="text-sm text-gray-500 mb-0.5">{t("this_is_to_certify")}</p>
<h1 className="text-6xl font-black text-slate-900 leading-none tracking-tight">
                  {cert.studentName}
              </h1>
              <p className="text-sm text-gray-500 mb-0.5">{t("has_completed")}</p>
<h2 className="text-3xl font-bold text-blue-600 max-w-4xl text-center">                {localizedText(cert.courseName)}
              </h2>
            </div>

            <div className="my-8">
              <p className="text-sm text-gray-600">{t("date_of_completion")}</p>
              <p className="text-lg font-medium">{formatDate(cert.completionDate)}</p>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600">
              <div>
                <p className="font-mono text-xs">{cert.certificateNumber}</p>
              </div>
              <div className="h-8 w-px bg-gray-300" />
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
