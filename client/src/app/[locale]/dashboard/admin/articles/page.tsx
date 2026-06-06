"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageTransition } from "@/components/page-transition";
import { DataGrid } from "@/components/admin/data-grid";
import { articlesApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, Loader2 } from "lucide-react";

export default function AdminArticlesPage() {
  const t = useTranslations("admin");
  const c = useTranslations("common");
  const params = useParams();
  const locale = params.locale || "en";
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    isPublished: false,
  });

  const fetchArticles = useCallback(async () => {
    try {
      const { data } = await articlesApi.list({ all: "true" });
      setArticles(data);
    } catch {
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", content: "", excerpt: "", isPublished: false });
    setDialogOpen(true);
  };

  const openEdit = (a: any) => {
    setEditing(a);
    setForm({
      title: a.title?.en || a.title || "",
      content: a.content?.en || a.content || "",
      excerpt: a.excerpt?.en || a.excerpt || "",
      isPublished: a.isPublished ?? false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: { en: form.title },
        content: { en: form.content },
        excerpt: { en: form.excerpt },
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        isPublished: form.isPublished,
      };
      if (editing) {
        await articlesApi.update(editing.id, payload);
        toast.success("Article updated");
      } else {
        await articlesApi.create(payload);
        toast.success("Article created");
      }
      setDialogOpen(false);
      fetchArticles();
    } catch (err: any) {
      const msg = err?.response?.data?.message?.[0] || err?.response?.data?.message || "Failed to save article";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await articlesApi.remove(deleteTarget.id);
      toast.success("Article deleted");
      setDeleteTarget(null);
      fetchArticles();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const columns = [
    { key: "title", header: t("title_col"), sortable: true, render: (row: any) => row.title?.en || row.title },
    { key: "authorId", header: t("author"), render: (row: any) => row.author?.name || (row.title?.en?.length || 0) > 20 ? "Admin" : "Admin" },
    { key: "publishedAt", header: t("published"), render: (row: any) => row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : "-" },
    { key: "isPublished", header: t("status"), render: (row: any) => <Badge variant={row.isPublished ? "default" : "secondary"}>{row.isPublished ? c("published") : c("draft")}</Badge> },
    {
      key: "actions",
      header: "",
      render: (row: any) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" asChild>
            <a href={`/${locale}/blog/${row.slug}`} target="_blank"><Eye className="h-3 w-3" /></a>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}><Pencil className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(row)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("articles_title")}</h1>
            <p className="text-muted-foreground">{t("articles_subtitle")}</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {t("new_article")}</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={articles} columns={columns} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="p-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {editing ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {editing ? "Edit Article" : "New Article"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Fill in the fields to configure the article</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto pr-3 scrollbar-thin">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Title (English)</label>
              <Input
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                placeholder="Enter article title..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Excerpt</label>
              <Input
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                placeholder="Brief summary..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Content</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={8}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[200px] resize-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                placeholder="Write your article content here..."
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
              <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
              <div>
                <label className="text-sm font-medium">Published</label>
                <p className="text-xs text-muted-foreground">Make this article visible to users</p>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-border/60 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl px-6 h-10 text-sm font-medium">{c("cancel")}</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="rounded-xl px-6 h-10 text-sm font-medium shadow-md">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? c("save") : c("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Article"
        description="Are you sure you want to delete this article?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </PageTransition>
  );
}