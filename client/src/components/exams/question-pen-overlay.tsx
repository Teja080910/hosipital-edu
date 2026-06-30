"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Pen, Highlighter, Eraser } from "lucide-react";

export function QuestionPenOverlay({ questionId, children }: { questionId: string; children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<"pen" | "highlighter" | null>(null);
  const drawing = useRef(false);
  const drawingsRef = useRef<Map<string, [{ x: number; y: number }[], string][]>>(new Map());
  const paths = useRef<[{ x: number; y: number }[], string][]>(drawingsRef.current.get(questionId) || []);
  const currentPath = useRef<{ x: number; y: number }[]>([]);

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const [path, color] of paths.current) {
      if (path.length < 2) continue;
      const isHighlighter = color.startsWith("rgba");
      ctx.strokeStyle = color;
      ctx.lineWidth = isHighlighter ? 24 : 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tool) return;
    drawing.current = true;
    currentPath.current = [getPos(e)];
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing.current || !tool) return;
    currentPath.current.push(getPos(e));
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = currentPath.current;
    if (p.length < 2) return;
    const color = tool === "highlighter" ? "rgba(253, 224, 71, 0.2)" : "#ef4444";
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === "highlighter" ? 28 : 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p[p.length - 2].x, p[p.length - 2].y);
    ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentPath.current.length > 0) {
      const color = tool === "highlighter" ? "rgba(253, 224, 71, 0.2)" : "#ef4444";
      paths.current.push([[...currentPath.current], color]);
      drawingsRef.current.set(questionId, paths.current);
    }
    currentPath.current = [];
  };

  const clear = () => {
    paths.current = [];
    currentPath.current = [];
    drawingsRef.current.set(questionId, []);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    paths.current = drawingsRef.current.get(questionId) || [];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redraw();
  }, [questionId, redraw]);

  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      redraw();
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      window.removeEventListener("resize", updateSize);
      observer.disconnect();
      drawingsRef.current.delete(questionId);
    };
  }, [redraw, questionId]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setTool(tool === "pen" ? null : "pen")}
          className={`p-1.5 rounded transition-colors ${tool === "pen" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          title="Pen"
        >
          <Pen className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setTool(tool === "highlighter" ? null : "highlighter")}
          className={`p-1.5 rounded transition-colors ${tool === "highlighter" ? "bg-yellow-500 text-yellow-950" : "hover:bg-muted"}`}
          title="Highlighter"
        >
          <Highlighter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={clear}
          className="p-1.5 rounded hover:bg-muted transition-colors"
          title="Clear"
        >
          <Eraser className="h-4 w-4" />
        </button>
      </div>
      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0"
          style={{ pointerEvents: tool ? "auto" : "none", cursor: tool === "highlighter" ? "cell" : tool === "pen" ? "crosshair" : "default" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <div className="relative z-10" style={{ pointerEvents: tool ? "none" : "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
