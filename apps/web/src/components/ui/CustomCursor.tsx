import { useEffect, useRef } from "react";

import { useUIStore } from "../../stores/uiStore";

export default function CustomCursor() {
  const horizRef = useRef<HTMLDivElement>(null);
  const vertRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const isCursorHidden = useUIStore((state) => state.isCursorHidden);

  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const locked = useRef(false);

  // SAMPLE A POINT'S BG COLOR
  const getColorAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return "rgb(0,0,0)";

    let bg = "transparent";
    let node: HTMLElement | null = el as HTMLElement;

    while (node && (bg === "transparent" || bg === "rgba(0, 0, 0, 0)")) {
      bg = getComputedStyle(node).backgroundColor;
      node = node.parentElement as HTMLElement | null;
    }
    return bg;
  };

  // LUMINANCE
  const luminance = (rgb: string) => {
    const m = rgb.match(/\d+/g);
    if (!m) return 0;
    const [r, g, b] = m.map(Number);
    return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  };

  useEffect(() => {
    const update = () => {
      locked.current = false;
      const x = mouseX.current;
      const y = mouseY.current;

      // move cursor lines
      horizRef.current!.style.transform = `translateY(${y}px)`;
      vertRef.current!.style.transform = `translateX(${x}px)`;
      boxRef.current!.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;



      // number of sampling points along each line
      const samples = 50;

      // ---- HORIZONTAL LINE ----
      {
        const segments: string[] = [];
        const step = window.innerWidth / samples;

        for (let i = 0; i < samples; i++) {
          const px = i * step;
          const bg = getColorAt(px, y);
          const col = luminance(bg) > 0.5 ? "black" : "white";
          segments.push(col);
        }

        // Convert to CSS gradient mask pattern
        const gradient = segments
          .map((c, i) => {
            const start = (i / samples) * 100;
            const end = ((i + 1) / samples) * 100;
            return `${c} ${start}% ${end}%`;
          })
          .join(", ");

        horizRef.current!.style.background = `linear-gradient(to right, ${gradient})`;
      }

      // ---- VERTICAL LINE ----
      {
        const segments: string[] = [];
        const step = window.innerHeight / samples;

        for (let i = 0; i < samples; i++) {
          const py = i * step;
          const bg = getColorAt(x, py);
          const col = luminance(bg) > 0.5 ? "black" : "white";
          segments.push(col);
        }

        const gradient = segments
          .map((c, i) => {
            const start = (i / samples) * 100;
            const end = ((i + 1) / samples) * 100;
            return `${c} ${start}% ${end}%`;
          })
          .join(", ");

        vertRef.current!.style.background = `linear-gradient(to bottom, ${gradient})`;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;

      if (!locked.current) {
        locked.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <>
      {/* HORIZONTAL LINE */}
      <div
        ref={horizRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] transition-opacity duration-200"
        style={{
          width: "100vw",
          height: "0.5px",
          background: "white",
          opacity: isCursorHidden ? 0 : 1,
        }}
      />

      {/* VERTICAL LINE */}
      <div
        ref={vertRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] transition-opacity duration-200"
        style={{
          width: "0.5px",
          height: "100vh",
          background: "white",
          opacity: isCursorHidden ? 0 : 1,
        }}
      />

      {/* CENTER BOX */}
      <div
        ref={boxRef}
        className="fixed pointer-events-none z-[100000] transition-opacity duration-200"
        style={{
          width: "6px",
          height: "6px",
          border: "1px solid black",
          background: "hsl(0,100%,50%)",
          animation: "rainbow 3s linear infinite",
          opacity: isCursorHidden ? 0 : 1,
        }}
      />

      <style>{`
        @keyframes rainbow {
          0% { background-color: hsl(0, 100%, 50%); }
          14% { background-color: hsl(30, 100%, 50%); }
          28% { background-color: hsl(60, 100%, 50%); }
          42% { background-color: hsl(120, 100%, 50%); }
          57% { background-color: hsl(180, 100%, 50%); }
          71% { background-color: hsl(240, 100%, 50%); }
          85% { background-color: hsl(270, 100%, 50%); }
          100% { background-color: hsl(0, 100%, 50%); }
        }
      `}</style>
    </>
  );
}
