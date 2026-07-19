"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/page-transition";
import { AccountTypeGate } from "@/components/account-type-gate";
import { flashcardsApi } from "@/lib/api/flashcards";
import { Play, GraduationCap, Settings2, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function FlashcardExamConfigPage() {
  const t = useTranslations("flashcards");
  const te = useTranslations("exams");
  const router = useRouter();
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(10);
  const [customTitle, setCustomTitle] = useState("");
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    flashcardsApi.specialties()
      .then((res) => setSpecialties(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async () => {
    setStarting(true);
    try {
      const { data } = await flashcardsApi.startExam({
        mode,
        questionCount,
        timeLimit: mode === "exam" ? timeLimit * 60 : undefined,
        customTitle: customTitle || undefined,
        specialtyId: selectedSpecialty || undefined,
      });
      router.push(`/dashboard/flashcards/exam/${data.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || te("start_failed");
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </PageTransition>
    );
  }

  return (
    <AccountTypeGate>
    <PageTransition>
      <div className="max-w-xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/flashcards")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("back_to_study")}
        </Button>
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t("exam_config_title")}</CardTitle>
            <CardDescription>{t("exam_config_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">{te("select_mode")}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode("practice")}
                  className={`rounded-lg border-2 p-4 text-center transition-colors ${mode === "practice" ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50"}`}
                >
                  <GraduationCap className="h-5 w-5 mx-auto mb-1" />
                  <p className="font-medium text-sm">{t("practice_mode")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("practice_mode_desc")}</p>
                </button>
                <button
                  onClick={() => setMode("exam")}
                  className={`rounded-lg border-2 p-4 text-center transition-colors ${mode === "exam" ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50"}`}
                >
                  <Play className="h-5 w-5 mx-auto mb-1" />
                  <p className="font-medium text-sm">{t("exam_mode")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("exam_mode_desc")}</p>
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{te("custom_title")}</label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={te("custom_title_placeholder")}
              />
            </div>

            {specialties.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">{te("specialty")}</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full rounded-lg border p-3 text-sm bg-background"
                >
                  <option value="">{t("all_specialties")}</option>
                  {specialties.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name?.en || s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">{te("select_questions")}</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 text-center"
              />
            </div>

            {mode === "exam" && (
              <div>
                <label className="text-sm font-medium mb-2 block">{te("time_limit")}</label>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 10, 15, 30, 60, 120].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setTimeLimit(opt)}
                      className={`rounded-lg border p-2 text-center text-sm transition-colors ${timeLimit === opt ? "border-primary bg-primary/5 font-medium" : "border-input hover:bg-muted/50"}`}
                    >
                      {te("minutes", { count: opt })}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full h-12 text-lg" onClick={handleStart} disabled={starting}>
              {starting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              {te("begin")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
    </AccountTypeGate>
  );
}
