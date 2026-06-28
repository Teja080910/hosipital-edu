"use client";

import { useRef, useCallback } from "react";
import { Bold, Italic, Underline } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  rows?: number;
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 100 }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  const exec = useCallback((cmd: string) => {
    document.execCommand(cmd, false);
    ref.current?.focus();
  }, []);

  const handleInput = () => {
    if (ref.current) {
      onChange(ref.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 border border-border/80 rounded-t-xl bg-muted/20 px-2 py-1.5">
        <button type="button" onClick={() => exec("bold")} className="p-1.5 rounded hover:bg-muted transition-colors" title="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => exec("italic")} className="p-1.5 rounded hover:bg-muted transition-colors" title="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => exec("underline")} className="p-1.5 rounded hover:bg-muted transition-colors" title="Underline">
          <Underline className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value }}
        className="w-full bg-muted/20 hover:bg-muted/40 border border-border/80 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-b-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 min-h-[100px] resize-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] shadow-none overflow-y-auto"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
