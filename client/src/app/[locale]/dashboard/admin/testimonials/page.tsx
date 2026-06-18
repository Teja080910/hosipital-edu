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
import { testimonialsApi } from "@/lib/api/testimonials";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";

export default function AdminTestimonialsPage() {
  const t = useTranslations("admin");
  const params = useParams();
  const locale = String(params.locale || "en");
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState({
    nameEn: "",
    nameEs: "",
    roleEn: "",
    roleEs: "",
    textEn: "",
    textEs: "",
    rating: 5,
    sortOrder: 0,
    isActive: true,
  });

  const fetchTestimonials = useCallback(async () => {
    try {
      const { data } = await testimonialsApi.getAllAdmin();
      setTestimonials(data);
    } catch {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      nameEn: "", nameEs: "", roleEn: "", roleEs: "",
      textEn: "", textEs: "", rating: 5, sortOrder: 0, isActive: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      nameEn: item.name?.en || "",
      nameEs: item.name?.es || "",
      roleEn: item.role?.en || "",
      roleEs: item.role?.es || "",
      textEn: item.text?.en || "",
      textEs: item.text?.es || "",
      rating: item.rating ?? 5,
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nameEn.trim() || !form.textEn.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: { en: form.nameEn, es: form.nameEs },
        role: { en: form.roleEn, es: form.roleEs },
        text: { en: form.textEn, es: form.textEs },
        rating: form.rating,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      if (editing) {
        await testimonialsApi.update(editing.id, payload);
        toast.success("Testimonial updated");
      } else {
        await testimonialsApi.create(payload);
        toast.success("Testimonial created");
      }
      setDialogOpen(false);
      fetchTestimonials();
    } catch {
      toast.error("Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await testimonialsApi.remove(deleteTarget.id);
      toast.success("Testimonial deleted");
      setDeleteTarget(null);
      fetchTestimonials();
    } catch {
      toast.error("Failed to delete testimonial");
    }
  };

  const toggleActive = async (item: any) => {
    try {
      await testimonialsApi.update(item.id, { isActive: !item.isActive });
      fetchTestimonials();
    } catch {
      toast.error("Failed to update testimonial");
    }
  };

  const columns = [
    {
      key: "rating",
      header: "Rating",
      render: (row: any) => (
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, j) => (
            <Star key={j} className={`h-3 w-3 ${j < (row.rating ?? 5) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          ))}
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (row: any) => row.name?.[locale] || row.name?.en || "",
    },
    {
      key: "role",
      header: "Role",
      render: (row: any) => row.role?.[locale] || row.role?.en || "",
    },
    {
      key: "text",
      header: "Testimonial",
      render: (row: any) => (
        <span className="line-clamp-2 italic text-muted-foreground">
          &ldquo;{row.text?.[locale] || row.text?.en || ""}&rdquo;
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Active",
      render: (row: any) => (
        <Switch
          checked={row.isActive}
          onCheckedChange={() => toggleActive(row)}
          className="scale-75"
        />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row: any) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(row)}>
            <Trash2 className="h-3 w-3" />
          </Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
            <p className="text-muted-foreground mt-1">Manage student testimonials shown on the landing page</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataGrid data={testimonials} columns={columns} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent key={dialogOpen ? "open" : "closed"} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name (EN)</label>
                <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="e.g. Maria Garcia" />
              </div>
              <div>
                <label className="text-sm font-medium">Name (ES)</label>
                <Input value={form.nameEs} onChange={(e) => setForm({ ...form, nameEs: e.target.value })} placeholder="e.g. Maria Garcia" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Role (EN)</label>
                <Input value={form.roleEn} onChange={(e) => setForm({ ...form, roleEn: e.target.value })} placeholder="e.g. Medical Student" />
              </div>
              <div>
                <label className="text-sm font-medium">Role (ES)</label>
                <Input value={form.roleEs} onChange={(e) => setForm({ ...form, roleEs: e.target.value })} placeholder="e.g. Estudiante de Medicina" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Testimonial (EN)</label>
              <Textarea value={form.textEn} onChange={(e) => setForm({ ...form, textEn: e.target.value })} rows={3} placeholder="What the student says..." />
            </div>
            <div>
              <label className="text-sm font-medium">Testimonial (ES)</label>
              <Textarea value={form.textEs} onChange={(e) => setForm({ ...form, textEs: e.target.value })} rows={3} placeholder="Lo que el estudiante dice..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Rating (1-5)</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sort Order</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end pb-1">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                <span className="ml-2 text-sm">Active</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        description="This action cannot be undone."
      />
    </PageTransition>
  );
}
