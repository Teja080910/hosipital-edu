"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { articlesApi } from "@/lib/api";
import { pickLocale } from "@/lib/utils/localized-text";
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
  const locale = (useParams()?.locale as string) || "en";

  useEffect(() => {
    if (!slug) return;
    articlesApi.get(slug).then(({ data }) => setArticle(data)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!article) return <div className="text-center py-16"><h2 className="text-xl font-semibold">{t("not_found")}</h2><Button variant="link" onClick={() => router.push("/blog")}>{t("back_to_blog")}</Button></div>;

  const lTitle = pickLocale(article.title, locale);
  const lExcerpt = pickLocale(article.excerpt, locale);
  const lContent = pickLocale(article.content, locale);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt={t("brand_name")} width={40} height={40} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">{t("brand_name")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link href={`/${locale}/blog`}>{t("nav_blog")}</Link></Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {!isLoading && user && (
              <Button size="sm" asChild><Link href="/dashboard">{t("nav_dashboard")}</Link></Button>
            )}
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-3xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/${locale}/blog`)} className="gap-2 mb-8">
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

          <h1 className="text-4xl font-bold tracking-tight mb-1">{lTitle}</h1>

          {article.contentImage && (
            <img src={article.contentImage} alt="" className="w-full rounded-xl my-4" />
          )}

          {lExcerpt && (
            <p className="text-base text-muted-foreground mb-1">{lExcerpt}</p>
          )}

          {(lExcerpt || lContent) && <Separator className="my-1" />}

          {lContent && (
          <div
            className="mt-0 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-medium [&_p]:leading-7 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_strong]:font-bold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_img]:rounded-xl [&_img]:my-6 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:px-4 [&_th]:py-2 [&_th]:bg-muted [&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2"
            dangerouslySetInnerHTML={{ __html: lContent.trim().replace(/\n/g, "<br/>") }}
          />
          )}
        </article>
      </div>
    </div>
  );
}
