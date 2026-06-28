"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PageTransition } from "@/components/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { usersApi, uploadApi } from "@/lib/api";
import { Loader2, Copy, Share2, Gift, Camera } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [referral, setReferral] = useState<{ referralCode: string; referralUrl: string; totalReferred: number } | null>(null);
  const [loadingRef, setLoadingRef] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setLoadingRef(true);
      usersApi.getReferral(user.id).then(({ data }) => setReferral(data)).catch(() => {}).finally(() => setLoadingRef(false));
    }
  }, [user]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(t("avatar_too_large")); return; }
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarPreview || !user) return;
    setUploadingAvatar(true);
    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise((resolve) => { reader.onload = resolve; });
      const base64 = (reader.result as string).split(",")[1];
      const ext = file.name.split(".").pop() || "png";
      const key = `avatars/${user.id}.${ext}`;
      const { data: uploadResult } = await uploadApi.uploadFile(key, base64, file.type);
      await usersApi.update(user.id, { avatarUrl: uploadResult.url });
      await refreshUser();
      setAvatarPreview(null);
      toast.success(t("avatar_updated"));
    } catch {
      toast.error(t("avatar_failed"));
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await usersApi.update(user.id, { name: name.trim() });
      await refreshUser();
      toast.success(t("saved"));
    } catch {
      toast.error(t("save_failed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("profile")}</CardTitle>
            <CardDescription>{t("profile_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarPreview || user?.avatarUrl} />
                  <AvatarFallback>
                    {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {(uploadingAvatar) && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
              {avatarPreview ? (
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={handleAvatarUpload} disabled={uploadingAvatar}>
                    {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t("save")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setAvatarPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                    {t("cancel")}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="h-4 w-4 mr-2" />
                  {t("change_avatar")}
                </Button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("full_name")}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving || !name?.trim()}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("save_changes")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("appearance")}</CardTitle>
            <CardDescription>{t("appearance_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("theme")}</Label>
                <p className="text-sm text-muted-foreground">{t("theme_desc")}</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("language")}</CardTitle>
            <CardDescription>{t("language_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label>{t("interface_language")}</Label>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("notifications")}</CardTitle>
            <CardDescription>{t("notifications_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("study_reminders")}</Label>
                <p className="text-sm text-muted-foreground">{t("study_reminders_desc")}</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("email_updates")}</Label>
                <p className="text-sm text-muted-foreground">{t("email_updates_desc")}</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {referral && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <CardTitle>{t("referral_title")}</CardTitle>
              </div>
              <CardDescription>{t("referral_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground">{t("your_code")}</p>
                  <p className="text-lg font-bold tracking-wider">{referral.referralCode}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(referral.referralCode); toast.success(t("copied")); }}>
                  <Copy className="h-4 w-4 mr-1" /> {t("copy")}
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("total_referred")}</span>
                <span className="font-semibold">{referral.totalReferred}</span>
              </div>
              <Button className="w-full" variant="outline" onClick={() => { navigator.clipboard.writeText(referral.referralUrl); toast.success(t("link_copied")); }}>
                <Share2 className="h-4 w-4 mr-2" /> {t("share_link")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}