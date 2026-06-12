"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition } from "@/components/page-transition";
import { calendarApi } from "@/lib/api/calendar";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Clock,
  GraduationCap,
  BookOpen,
  User,
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const typeIcons: Record<string, any> = {
  exam: GraduationCap,
  study_schedule: BookOpen,
  personal: User,
};

const typeColors: Record<string, string> = {
  exam: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  study_schedule: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  personal: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
};

function formatTime(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

export default function CalendarPage() {
  const t = useTranslations("calendar");
  const n = useTranslations("nav");

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", eventType: "study_schedule", eventDate: "", eventTime: "", isAllDay: false });

  const startDate = useMemo(() => new Date(currentYear, currentMonth, 1), [currentMonth, currentYear]);
  const endDate = useMemo(() => {
    const d = new Date(currentYear, currentMonth + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [currentMonth, currentYear]);

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await calendarApi.list({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setEvents(data || []);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = toDateStr(new Date());

  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    events.forEach((e: any) => {
      const key = toDateStr(new Date(e.eventDate));
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const openCreateDialog = (dateStr?: string) => {
    setEditingEvent(null);
    setForm({ title: "", description: "", eventType: "study_schedule", eventDate: dateStr || toDateStr(new Date()), eventTime: "", isAllDay: false });
    setDialogOpen(true);
  };

  const openEditDialog = (event: any) => {
    setEditingEvent(event);
    setForm({
      title: typeof event.title === "object" ? (event.title?.en || "") : event.title || "",
      description: typeof event.description === "object" ? (event.description?.en || "") : event.description || "",
      eventType: event.eventType || "study_schedule",
      eventDate: toDateStr(new Date(event.eventDate)),
      eventTime: event.eventTime || "",
      isAllDay: event.isAllDay || false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const body: any = {
        title: { en: form.title, es: form.title },
        description: { en: form.description, es: form.description },
        eventType: form.eventType,
        eventDate: new Date(form.eventDate).toISOString(),
        eventTime: form.eventTime || null,
        isAllDay: form.isAllDay,
      };
      if (editingEvent) {
        await calendarApi.update(editingEvent.id, body);
        toast.success("Event updated");
      } else {
        await calendarApi.create(body);
        toast.success("Event created");
      }
      setDialogOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch {
      toast.error("Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await calendarApi.remove(id);
      toast.success("Event deleted");
      fetchEvents();
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const dayEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{n("calendar") || "Calendar"}</h1>
            <p className="text-muted-foreground">{t("subtitle") || "Manage your study schedule"}</p>
          </div>
          <Button onClick={() => openCreateDialog()}><Plus className="h-4 w-4 mr-2" />{t("add_event") || "Add Event"}</Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-5 w-5" /></Button>
                <CardTitle className="text-lg">{MONTHS[currentMonth]} {currentYear}</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}><ChevronRight className="h-5 w-5" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-7 mb-2">
                    {DAYS.map(d => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7">
                    {days.map((d, i) => {
                      if (d === null) return <div key={`empty-${i}`} className="min-h-[90px] p-1" />;
                      const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
                      const dayEvents = eventsByDate[dateStr] || [];
                      const isToday = dateStr === today;
                      const isSelected = dateStr === selectedDate;
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`min-h-[90px] p-1 border border-border/30 rounded-md text-left transition-colors hover:bg-accent/30 ${
                            isSelected ? "ring-2 ring-primary" : ""
                          }`}
                        >
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            isToday ? "bg-primary text-primary-foreground" : ""
                          }`}>
                            {d}
                          </span>
                          <div className="space-y-0.5 mt-1">
                            {dayEvents.slice(0, 3).map((e: any) => (
                              <div
                                key={e.id}
                                className={`text-[10px] px-1 py-0.5 rounded truncate ${typeColors[e.eventType] || "bg-muted"}`}
                              >
                                {typeof e.title === "object" ? (e.title?.en || "") : e.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 3} more</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">{t("events") || "Events"}</CardTitle>
              {selectedDate && (
                <Button size="sm" variant="outline" onClick={() => openCreateDialog(selectedDate)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> {t("add") || "Add"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t("select_day") || "Select a day to view events"}</p>
              ) : dayEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">{t("no_events") || "No events on this day"}</p>
                  <Button variant="link" size="sm" onClick={() => openCreateDialog(selectedDate)}>
                    {t("create_first") || "Create your first event"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">{selectedDate}</p>
                  {dayEvents.map((e: any) => {
                    const Icon = typeIcons[e.eventType] || Clock;
                    const title = typeof e.title === "object" ? (e.title?.en || "") : e.title;
                    return (
                      <div key={e.id} className={`rounded-lg p-3 border ${typeColors[e.eventType] || ""}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{title}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(e)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(e.id)}>
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        {e.eventTime && !e.isAllDay && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {e.eventTime}
                          </div>
                        )}
                        {e.isAllDay && <div className="text-xs text-muted-foreground mt-1">All day</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEvent ? (t("edit_event") || "Edit Event") : (t("new_event") || "New Event")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("title") || "Title"}</label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
              </div>
              <div>
                <label className="text-sm font-medium">{t("type") || "Type"}</label>
                <Select value={form.eventType} onValueChange={v => setForm({ ...form, eventType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="study_schedule">{t("study_schedule") || "Study Schedule"}</SelectItem>
                    <SelectItem value="exam">{t("exam") || "Exam"}</SelectItem>
                    <SelectItem value="personal">{t("personal") || "Personal"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t("date") || "Date"}</label>
                <Input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isAllDay" checked={form.isAllDay} onChange={e => setForm({ ...form, isAllDay: e.target.checked })} className="rounded" />
                <label htmlFor="isAllDay" className="text-sm">{t("all_day") || "All day"}</label>
              </div>
              {!form.isAllDay && (
                <div>
                  <label className="text-sm font-medium">{t("time") || "Time"}</label>
                  <Input type="time" value={form.eventTime} onChange={e => setForm({ ...form, eventTime: e.target.value })} />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">{t("description") || "Description"}</label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" rows={3} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel") || "Cancel"}</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingEvent ? (t("save") || "Save") : (t("create") || "Create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
