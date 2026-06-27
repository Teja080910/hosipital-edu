import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

export default function RootLoading() {
  const c = useTranslations("common");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{c("loading")}</p>
      </div>
    </div>
  );
}
