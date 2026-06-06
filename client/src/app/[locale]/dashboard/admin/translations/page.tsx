"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageTransition } from "@/components/page-transition";
import { DataGrid } from "@/components/admin/data-grid";
import { translationsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Save, Download, Plus, Languages } from "lucide-react";

interface TranslationRow {
  id: string;
  key: string;
  namespace: string;
  en: string;
  es: string;
  enId?: string;
  esId?: string;
}

export default function AdminTranslationsPage() {
  const t = useTranslations("admin");
  const [rows, setRows] = useState<TranslationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [namespaceFilter, setNamespaceFilter] = useState("all");
  const [namespaces, setNamespaces] = useState<string[]>([]);

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await translationsApi.list();
      const grouped: Record<string, TranslationRow> = {};
      const ns = new Set<string>();
      for (const item of data) {
        ns.add(item.namespace);
        if (!grouped[item.key]) {
          grouped[item.key] = { id: item.id, key: item.key, namespace: item.namespace, en: "", es: "", enId: undefined, esId: undefined };
        }
        const row = grouped[item.key];
        if (item.locale === "en") { row.en = item.value; row.enId = item.id; }
        if (item.locale === "es") { row.es = item.value; row.esId = item.id; }
      }
      setNamespaces(Array.from(ns).sort());
      setRows(Object.values(grouped));
    } catch {
      toast.error("Failed to load translations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetched = useRef(false);
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchTranslations();
  }, [fetchTranslations]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ key: "", namespace: "custom" });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!addForm.key.trim()) return;
    setAdding(true);
    try {
      await translationsApi.create({ key: addForm.key, locale: "en", value: "", namespace: addForm.namespace });
      await translationsApi.create({ key: addForm.key, locale: "es", value: "", namespace: addForm.namespace });
      toast.success(t("key_added"));
      setAddDialogOpen(false);
      setAddForm({ key: "", namespace: "custom" });
      fetchTranslations();
    } catch (err: any) {
      const msg = err?.response?.data?.message?.[0] || err?.response?.data?.message || t("key_add_failed");
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  const updateValue = (key: string, locale: "en" | "es", value: string) => {
    setRows((prev) => prev.map((r) => r.key === key ? { ...r, [locale]: value } : r));
  };

  const saveRow = async (row: TranslationRow) => {
    setSavingId(row.key);
    try {
      if (row.enId) await translationsApi.update(row.enId, { value: row.en });
      if (row.esId) await translationsApi.update(row.esId, { value: row.es });
      toast.success(t("translations_saved"));
    } catch {
      toast.error(t("translations_save_failed"));
    } finally {
      setSavingId(null);
    }
  };

  const addNew = () => {
    setAddForm({ key: "", namespace: "custom" });
    setAddDialogOpen(true);
  };

  const handleExport = async () => {
    try {
      const { data } = await translationsApi.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "translations.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("exported"));
    } catch {
      toast.error(t("export_failed"));
    }
  };

  const autoTranslate = async () => {
    try {
      await translationsApi.autoTranslate("en", "es", namespaceFilter === "all" ? undefined : namespaceFilter);
      toast.success(t("auto_translate_done"));
      fetchTranslations();
    } catch {
      toast.error(t("auto_translate_failed"));
    }
  };

  const filteredRows = namespaceFilter === "all" ? rows : rows.filter((r) => r.namespace === namespaceFilter);

  const columns = [
    { key: "key", header: t("key"), sortable: true },
    { key: "namespace", header: t("namespace"), render: (row: TranslationRow) => <Badge variant="outline">{row.namespace}</Badge> },
    {
      key: "en",
      header: t("english"),
      render: (row: TranslationRow) => (
        <Input value={row.en} onChange={(e) => updateValue(row.key, "en", e.target.value)} className="h-8 text-sm" />
      ),
    },
    {
      key: "es",
      header: t("spanish"),
      render: (row: TranslationRow) => (
        <Input value={row.es} onChange={(e) => updateValue(row.key, "es", e.target.value)} className="h-8 text-sm" />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row: TranslationRow) => (
        <Button size="sm" variant="ghost" onClick={() => saveRow(row)} disabled={savingId === row.key}>
          {savingId === row.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
        </Button>
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
            <h1 className="text-3xl font-bold tracking-tight">{t("translations_title")}</h1>
            <p className="text-muted-foreground">{t("translations_subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> {t("export")}</Button>
            <Button variant="outline" onClick={autoTranslate}><Languages className="h-4 w-4 mr-2" /> {t("auto_translate")}</Button>
            <Button onClick={addNew}><Plus className="h-4 w-4 mr-2" /> {t("add_key")}</Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("filter_namespace")}</span>
          <Select value={namespaceFilter} onValueChange={setNamespaceFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              {namespaces.map((ns) => (
                <SelectItem key={ns} value={ns}>{ns}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataGrid data={filteredRows} columns={columns} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold tracking-tight">Add Translation</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Create a new translation key for all locales</p>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Key</label>
              <Input
                autoFocus
                value={addForm.key}
                onChange={(e) => setAddForm({ ...addForm, key: e.target.value })}
                placeholder="e.g. common.save"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Namespace</label>
              <Input
                value={addForm.namespace}
                onChange={(e) => setAddForm({ ...addForm, namespace: e.target.value })}
                placeholder="e.g. common, admin, auth"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t border-border/60 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="rounded-xl px-6 h-10 text-sm font-medium">Cancel</Button>
            <Button onClick={handleAdd} disabled={adding || !addForm.key.trim()} className="rounded-xl px-6 h-10 text-sm font-medium shadow-md">
              {adding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}