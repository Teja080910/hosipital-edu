"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { articlesApi } from "@/lib/api";
import { Loader2, Calendar, ArrowRight, GraduationCap, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";

export default function BlogPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const { user, isLoading } = useAuth();

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
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-subtle">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">Hospital EDU</span>
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
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground mt-2">Educational articles and updates</p>
        </div>

        {articles.length === 0 ? (
          <p className="text-center text-muted-foreground">No articles published yet.</p>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {article.isSubscriberOnly && <Badge variant="secondary">Subscribers only</Badge>}
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
                      Read more <ArrowRight className="h-3 w-3" />
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