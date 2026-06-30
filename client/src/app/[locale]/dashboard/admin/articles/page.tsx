"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { articlesApi, uploadApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, ImagePlus, Loader2, EyeOff } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
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
      toast.error(t("load_failed_articles"));
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
        toast.success(t("article_updated"));
      } else {
        await articlesApi.create(payload);
        toast.success(t("article_created"));
      }
      setDialogOpen(false);
      fetchArticles();
    } catch (err: any) {
      const msg = err?.response?.data?.message?.[0] || err?.response?.data?.message || t("article_save_failed");
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const ext = file.name.split(".").pop() || "png";
      const key = `article-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { data } = await uploadApi.uploadFile(key, base64, file.type);
      const imgTag = `<img src="${data.url}" alt="" />`;
      const ta = contentRef.current;
      if (ta) {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = form.content.slice(0, start);
        const after = form.content.slice(end);
        setForm({ ...form, content: before + imgTag + after });
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + imgTag.length; ta.focus(); });
      } else {
        setForm({ ...form, content: form.content + imgTag });
      }
      toast.success(t("image_uploaded"));
    } catch {
      toast.error(t("image_upload_failed"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await articlesApi.remove(deleteTarget.id);
      toast.success(t("article_deleted"));
      setDeleteTarget(null);
      fetchArticles();
    } catch {
      toast.error(t("article_delete_failed"));
    }
  };

  const columns = [
    { key: "title", header: t("title_col"), sortable: true, render: (row: any) => row.title?.en || row.title },
    { key: "authorId", header: t("author"), render: (row: any) => row.author?.name || t("admin_name") },
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
                  {editing ? t("edit_article") : t("new_article")}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{t("configure_article")}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto pr-3 scrollbar-thin">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("title_english")}</label>
              <Input
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                placeholder={t("article_title_placeholder")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("excerpt")}</label>
              <Input
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                placeholder="Brief summary..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("content")}</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="h-8 gap-1.5 rounded-lg text-xs"
                  >
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                    {uploading ? c("loading") : t("add_image")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreview(!preview)}
                    className="h-8 gap-1.5 rounded-lg text-xs"
                  >
                    {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {preview ? "Edit" : "Preview"}
                  </Button>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {preview ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none w-full min-h-[200px] p-4 rounded-xl border border-border/80 bg-background"
                  dangerouslySetInnerHTML={{ __html: form.content || `<p class='text-muted-foreground/50 italic'>${t("no_content_yet")}</p>` }}
                />
              ) : (
                <Textarea
                  ref={contentRef}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[200px] resize-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none"
                  placeholder={t("article_content_placeholder")}
                />
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
              <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
              <div>
                <label className="text-sm font-medium">{t("published_label")}</label>
                <p className="text-xs text-muted-foreground">{t("published_desc")}</p>
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
        title={t("delete_article_title")}
        description={t("delete_article_confirm")}
        confirmLabel={c("delete")}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </PageTransition>
  );
}
