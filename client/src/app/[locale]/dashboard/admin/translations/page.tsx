"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  useEffect(() => { fetchTranslations(); }, [fetchTranslations]);

  const updateValue = (key: string, locale: "en" | "es", value: string) => {
    setRows((prev) => prev.map((r) => r.key === key ? { ...r, [locale]: value } : r));
  };

  const saveRow = async (row: TranslationRow) => {
    setSavingId(row.key);
    try {
      if (row.enId) await translationsApi.update(row.enId, { value: row.en });
      if (row.esId) await translationsApi.update(row.esId, { value: row.es });
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  const addNew = async () => {
    const key = prompt("Enter translation key (e.g. nav.home):");
    if (!key) return;
    try {
      await translationsApi.create({ key, locale: "en", value: "", namespace: "custom" });
      await translationsApi.create({ key, locale: "es", value: "", namespace: "custom" });
      toast.success("Translation key added");
      fetchTranslations();
    } catch {
      toast.error("Failed to add key");
    }
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
      toast.success("Exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const autoTranslate = async () => {
    try {
      await translationsApi.autoTranslate("en", "es", namespaceFilter === "all" ? undefined : namespaceFilter);
      toast.success("Auto-translate complete");
      fetchTranslations();
    } catch {
      toast.error("Auto-translate failed");
    }
  };

  const filteredRows = namespaceFilter === "all" ? rows : rows.filter((r) => r.namespace === namespaceFilter);

  const columns = [
    { key: "key", header: "Key", sortable: true },
    { key: "namespace", header: "Namespace", render: (row: TranslationRow) => <Badge variant="outline">{row.namespace}</Badge> },
    {
      key: "en",
      header: "English",
      render: (row: TranslationRow) => (
        <Input value={row.en} onChange={(e) => updateValue(row.key, "en", e.target.value)} className="h-8 text-sm" />
      ),
    },
    {
      key: "es",
      header: "Spanish",
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
            <h1 className="text-3xl font-bold tracking-tight">Translations</h1>
            <p className="text-muted-foreground">Manage i18n translation strings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Export</Button>
            <Button variant="outline" onClick={autoTranslate}><Languages className="h-4 w-4 mr-2" /> Auto-Translate</Button>
            <Button onClick={addNew}><Plus className="h-4 w-4 mr-2" /> Add Key</Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by namespace:</span>
          <Select value={namespaceFilter} onValueChange={setNamespaceFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
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
    </PageTransition>
  );
}