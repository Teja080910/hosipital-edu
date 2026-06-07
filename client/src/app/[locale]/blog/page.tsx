"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { articlesApi } from "@/lib/api";
import { Loader2, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";

export default function BlogPage() {
  const t = useTranslations("blog");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articlesApi.list().then(({ data }) => setArticles(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <PublicNav />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>

        {articles.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("no_articles")}</p>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {article.isSubscriberOnly && <Badge variant="secondary">{t("subscribers_only")}</Badge>}
                    {article.publishedAt && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl">{article.title?.en || article.title}</CardTitle>
                  {article.excerpt?.en && (
                    <CardDescription className="line-clamp-2">{article.excerpt.en}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button variant="link" className="p-0 h-auto text-sm gap-1" asChild>
                    <Link href={`/blog/${article.slug}`}>
                      {t("read_more")} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}