"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { DataGrid } from "@/components/admin/data-grid";
import { Save } from "lucide-react";

const mockTranslations = [
  { id: "1", key: "nav.dashboard", en: "Dashboard", es: "Panel" },
  { id: "2", key: "nav.questions", en: "Questions", es: "Preguntas" },
  { id: "3", key: "nav.flashcards", en: "Flashcards", es: "Tarjetas" },
  { id: "4", key: "auth.login_title", en: "Welcome back", es: "Bienvenido de nuevo" },
];

export default function AdminTranslationsPage() {
  const columns = [
    { key: "key", header: "Key", sortable: true },
    { key: "en", header: "English", sortable: true },
    { key: "es", header: "Spanish", sortable: true },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Translations</h1>
            <p className="text-muted-foreground">Manage i18n translation strings</p>
          </div>
          <Button><Save className="h-4 w-4 mr-2" /> Save All</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataGrid data={mockTranslations} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}