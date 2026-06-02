"use client";

import { Button } from "@/components/ui/button";

interface FlashcardReviewProps {
  onRate: (rating: string) => void;
}

export function FlashcardReview({ onRate }: FlashcardReviewProps) {
  return (
    <div className="text-center space-y-4">
      <p className="text-sm text-muted-foreground">How well did you know?</p>
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onRate("again")} className="text-destructive border-destructive/30 hover:bg-destructive/10">
          Again
        </Button>
        <Button variant="outline" size="sm" onClick={() => onRate("hard")} className="text-orange-500 border-orange-500/30 hover:bg-orange-500/10">
          Hard
        </Button>
        <Button variant="outline" size="sm" onClick={() => onRate("good")} className="text-green-500 border-green-500/30 hover:bg-green-500/10">
          Good
        </Button>
        <Button variant="outline" size="sm" onClick={() => onRate("easy")} className="text-blue-500 border-blue-500/30 hover:bg-blue-500/10">
          Easy
        </Button>
      </div>
    </div>
  );
}