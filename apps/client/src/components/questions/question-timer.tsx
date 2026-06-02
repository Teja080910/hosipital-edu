"use client";

import { useEffect } from "react";
import { Clock } from "lucide-react";

interface QuestionTimerProps {
  timeRemaining: number;
  onTick: () => void;
  onTimeUp: () => void;
}

export function QuestionTimer({ timeRemaining, onTick, onTimeUp }: QuestionTimerProps) {
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }
    const interval = setInterval(onTick, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining, onTick, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Clock className="h-4 w-4" />
      <span className={timeRemaining < 60 ? "text-destructive" : ""}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}