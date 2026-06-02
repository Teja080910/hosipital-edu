"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlashcardCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardCard({ front, back, isFlipped, onFlip }: FlashcardCardProps) {
  return (
    <div
      className="perspective-[1000px] cursor-pointer h-64"
      onClick={onFlip}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-xl border bg-card p-8 flex items-center justify-center text-center backface-hidden",
            "shadow-medium"
          )}
        >
          <p className="text-lg font-medium">{front}</p>
        </div>
        <div
          className={cn(
            "absolute inset-0 rounded-xl border bg-card p-8 flex items-center justify-center text-center backface-hidden",
            "shadow-medium"
          )}
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-lg text-primary font-medium">{back}</p>
        </div>
      </motion.div>
    </div>
  );
}