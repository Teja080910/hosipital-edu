"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2 } from "lucide-react";
import { examsApi } from "@/lib/api";
import { localizedText as localized } from "@/lib/utils";

interface Filters {
  specialtyId: string;
  topicId: string;
  difficulty: string;
}

interface QuestionFilterProps {
  examId?: string;
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function QuestionFilter({ examId, filters, onChange }: QuestionFilterProps) {
  const t = useTranslations("questions");
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    examsApi.get(examId)
      .then((res) => setSpecialties(res.data.specialties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [examId]);

  useEffect(() => {
    const spec = specialties.find((s) => s.id === filters.specialtyId);
    setTopics(spec?.topics || []);
  }, [filters.specialtyId, specialties]);

  const reset = () => onChange({ specialtyId: "", topicId: "", difficulty: "" });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{t("filters")}</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            {specialties.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t("filter_specialty")}</label>
                <Select value={filters.specialtyId} onValueChange={(v) => onChange({ ...filters, specialtyId: v, topicId: "" })}>
                  <SelectTrigger><SelectValue placeholder={t("all_specialties")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_specialties")}</SelectItem>
                    {specialties.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{localized(s.name)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {filters.specialtyId && topics.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t("filter_topic")}</label>
                <Select value={filters.topicId} onValueChange={(v) => onChange({ ...filters, topicId: v })}>
                  <SelectTrigger><SelectValue placeholder={t("all_topics")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_topics")}</SelectItem>
                    {topics.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{localized(t.name)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">{t("filter_difficulty")}</label>
              <Select value={filters.difficulty} onValueChange={(v) => onChange({ ...filters, difficulty: v })}>
                <SelectTrigger><SelectValue placeholder={t("all_levels")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_levels")}</SelectItem>
                  <SelectItem value="easy">{t("easy")}</SelectItem>
                  <SelectItem value="medium">{t("medium")}</SelectItem>
                  <SelectItem value="hard">{t("hard")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}