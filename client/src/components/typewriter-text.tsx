"use client";

import { useState, useEffect, useCallback } from "react";

interface TypewriterPart {
  text: string;
  className?: string;
}

interface TypewriterTextProps {
  parts: TypewriterPart[];
  speed?: number;
  deleteSpeed?: number;
  pauseEnd?: number;
  pauseStart?: number;
}

export function TypewriterText({ parts, speed = 60, deleteSpeed = 30, pauseEnd = 2000, pauseStart = 800 }: TypewriterTextProps) {
  const fullText = parts.map((p) => p.text).join("");
  const [displayed, setDisplayed] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const tick = useCallback(() => {
    if (!deleting) {
      if (displayed < fullText.length) {
        setDisplayed((d) => d + 1);
      } else {
        setTimeout(() => setDeleting(true), pauseEnd);
      }
    } else {
      if (displayed > 0) {
        setDisplayed((d) => d - 1);
      } else {
        setTimeout(() => setDeleting(false), pauseStart);
      }
    }
  }, [displayed, deleting, fullText.length, pauseEnd, pauseStart]);

  useEffect(() => {
    const timer = setTimeout(tick, deleting ? deleteSpeed : speed);
    return () => clearTimeout(timer);
  }, [tick, deleting, deleteSpeed, speed]);

  const charIndex = (() => {
    let remaining = displayed;
    const segments: { partIndex: number; charCount: number }[] = [];
    for (let i = 0; i < parts.length; i++) {
      const take = Math.min(remaining, parts[i].text.length);
      segments.push({ partIndex: i, charCount: take });
      remaining -= take;
      if (remaining <= 0) break;
    }
    return segments;
  })();

  return (
    <>
      {parts.map((part, i) => {
        const seg = charIndex.find((s) => s.partIndex === i);
        const visible = seg ? seg.charCount : 0;
        return (
          <span key={i} className={part.className}>
            {part.text.slice(0, visible)}
          </span>
        );
      })}
      <span className="animate-pulse font-light text-primary/70">|</span>
    </>
  );
}