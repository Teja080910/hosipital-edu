"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parametersApi } from "@/lib/api";
import { useRouter } from "@/routing";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const CONTENT_MAP: Record<string, string> = {
  "terms": "terms_of_service",
  "privacy": "privacy_policy",
  "faq": "faq_content",
};

export default function ContentPage({ params }: { params: { key: string; locale: string } }) {
  const t = useTranslations("content");
  const router = useRouter();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paramKey = CONTENT_MAP[params.key] || params.key;
  const locale = params.locale;

  useEffect(() => {
    parametersApi.get(paramKey)
      .then(({ data }) => setContent(data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [paramKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("not_found")}</h1>
        <p className="text-muted-foreground mb-6">{t("not_found_desc")}</p>
        <Button onClick={() => router.push("/")}>{t("go_home")}</Button>
      </div>
    );
  }

  const val = typeof content.value === "object" ? content.value : { en: String(content.value) };
  const body = val?.[locale] || val?.en || "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> {t("back")}
      </Button>
      <Card>
        <CardContent className="p-8">
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{body}</div>
        </CardContent>
      </Card>
    </div>
  );
}