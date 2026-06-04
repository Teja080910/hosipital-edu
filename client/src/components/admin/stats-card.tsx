import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  color?: string;
}

export function StatsCard({ icon: Icon, label, value, trend, color = "text-primary" }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("rounded-full p-2 bg-muted", color)}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span className="text-xs font-medium text-green-500">{trend}</span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}