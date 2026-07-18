"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Calculator, X } from "lucide-react";

export function FloatingCalculator() {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const prev = useRef<number | null>(null);
  const op = useRef<string | null>(null);
  const clearNext = useRef(false);

  const input = (val: string) => {
    if (clearNext.current) {
      setDisplay(val);
      clearNext.current = false;
    } else {
      setDisplay((d) => (d === "0" ? val : d + val));
    }
  };

  const dot = () => {
    if (clearNext.current) {
      setDisplay("0.");
      clearNext.current = false;
    } else {
      setDisplay((d) => (d.includes(".") ? d : d + "."));
    }
  };

  const handleOp = (next: string) => {
    const n = parseFloat(display);
    if (prev.current === null) {
      prev.current = n;
    } else if (op.current) {
      const a = prev.current;
      const b = n;
      let r = 0;
      if (op.current === "+") r = a + b;
      else if (op.current === "-") r = a - b;
      else if (op.current === "*") r = a * b;
      else if (op.current === "/") r = b !== 0 ? a / b : 0;
      setDisplay(String(r));
      prev.current = r;
    }
    op.current = next;
    clearNext.current = true;
  };

  const eq = () => {
    if (op.current === null || prev.current === null) return;
    const n = parseFloat(display);
    const a = prev.current;
    const b = n;
    let r = 0;
    if (op.current === "+") r = a + b;
    else if (op.current === "-") r = a - b;
    else if (op.current === "*") r = a * b;
    else if (op.current === "/") r = b !== 0 ? a / b : 0;
    setDisplay(String(r));
    prev.current = null;
    op.current = null;
    clearNext.current = true;
  };

  const ac = () => {
    setDisplay("0");
    prev.current = null;
    op.current = null;
    clearNext.current = false;
  };

  const neg = () => setDisplay((d) => (d.startsWith("-") ? d.slice(1) : "-" + d));
  const pct = () => setDisplay((d) => String(parseFloat(d) / 100));

  const btn = (label: string, onClick: () => void, cls = "") => (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`h-11 rounded-lg text-sm font-medium transition-colors active:scale-95 select-none ${cls}`}
    >
      {label}
    </button>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-[999] h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90"
      >
        <Calculator className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed bottom-16 right-5 z-[999] w-60 p-3 rounded-xl border bg-card shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t("calculator")}</span>
            <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="bg-muted rounded-lg p-3 mb-2 text-right text-xl font-mono font-semibold truncate">
            {display}
          </div>

          <div className="grid grid-cols-4 gap-1">
            {btn("AC", ac, "bg-muted hover:bg-muted/80")}
            {btn("+/-", neg, "bg-muted hover:bg-muted/80")}
            {btn("%", pct, "bg-muted hover:bg-muted/80")}
            {btn("÷", () => handleOp("/"), op.current === "/" ? "bg-primary text-primary-foreground" : "bg-primary/10 hover:bg-primary/20 text-primary")}

            {btn("7", () => input("7"), "bg-background hover:bg-muted")}
            {btn("8", () => input("8"), "bg-background hover:bg-muted")}
            {btn("9", () => input("9"), "bg-background hover:bg-muted")}
            {btn("×", () => handleOp("*"), op.current === "*" ? "bg-primary text-primary-foreground" : "bg-primary/10 hover:bg-primary/20 text-primary")}

            {btn("4", () => input("4"), "bg-background hover:bg-muted")}
            {btn("5", () => input("5"), "bg-background hover:bg-muted")}
            {btn("6", () => input("6"), "bg-background hover:bg-muted")}
            {btn("-", () => handleOp("-"), op.current === "-" ? "bg-primary text-primary-foreground" : "bg-primary/10 hover:bg-primary/20 text-primary")}

            {btn("1", () => input("1"), "bg-background hover:bg-muted")}
            {btn("2", () => input("2"), "bg-background hover:bg-muted")}
            {btn("3", () => input("3"), "bg-background hover:bg-muted")}
            {btn("+", () => handleOp("+"), op.current === "+" ? "bg-primary text-primary-foreground" : "bg-primary/10 hover:bg-primary/20 text-primary")}

            {btn("0", () => input("0"), "bg-background hover:bg-muted col-span-2")}
            {btn(".", dot, "bg-background hover:bg-muted")}
            {btn("=", eq, "bg-primary hover:bg-primary/90 text-primary-foreground")}
          </div>
        </div>
      )}
    </>
  );
}
