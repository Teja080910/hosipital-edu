"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { articlesApi } from "@/lib/api";
import { Loader2, ArrowLeft, Calendar, Sun, Moon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";

export default function ArticlePage() {
  const t = useTranslations("blog");
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!slug) return;
    articlesApi.get(slug).then(({ data }) => setArticle(data)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!article) return <div className="text-center py-16"><h2 className="text-xl font-semibold">{t("not_found")}</h2><Button variant="link" onClick={() => router.push("/blog")}>{t("back_to_blog")}</Button></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="MD Exam" width={40} height={40} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">MD Exams</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link href="/blog">Blog</Link></Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {!isLoading && user && (
              <Button size="sm" asChild><Link href="/dashboard">Dashboard</Link></Button>
            )}
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => router.push("/blog")} className="gap-2 mb-8">
          <ArrowLeft className="h-4 w-4" /> {t("back_to_blog")}
        </Button>

        <article>
          <div className="flex items-center gap-2 mb-4">
            {article.publishedAt && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            )}
            {article.isSubscriberOnly && <Badge variant="secondary">{t("subscribers_only")}</Badge>}
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-4">{article.title?.en || article.title}</h1>

          {article.excerpt?.en && (
            <p className="text-lg text-muted-foreground mb-8">{article.excerpt.en}</p>
          )}

          <Separator className="mb-8" />

          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content?.en || article.content || "" }}
          />
        </article>
      </div>
    </div>
  );
}