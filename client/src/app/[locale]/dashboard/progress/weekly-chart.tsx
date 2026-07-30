"use client";

import { useTranslations } from "next-intl";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyChartProps {
  data?: { date: string; count: number }[];
  dayNames?: string[];
  noDataText?: string;
}

export default function WeeklyChart({ data = [], dayNames: propDayNames, noDataText: propNoDataText }: WeeklyChartProps) {
  const t = useTranslations("admin");
  const tp = useTranslations("progress");
  const dayNames = propDayNames || [t("day_sun"), t("day_mon"), t("day_tue"), t("day_wed"), t("day_thu"), t("day_fri"), t("day_sat")];
  const noDataText = propNoDataText || tp("no_data_yet");
  const chartData = data.map(d => {
    const day = new Date(d.date).getDay();
    return { day: dayNames[day], minutes: d.count * 2 };
  });
  if (!chartData.length) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">{noDataText}</div>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="day" className="text-xs text-muted-foreground" />
        <YAxis className="text-xs text-muted-foreground" />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
        />
        <Bar dataKey="minutes" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
