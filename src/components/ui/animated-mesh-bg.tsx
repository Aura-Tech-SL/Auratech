"use client";

import { useEffect, useRef } from "react";

export function AnimatedMeshBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    function resize() {
      w = canvas!.parentElement?.clientWidth || window.innerWidth;
      h = canvas!.parentElement?.clientHeight || window.innerHeight;
      canvas!.width = w * 0.5;
      canvas!.height = h * 0.5;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
    }

    resize();
    window.addEventListener("resize", resize);

    const orbs = [
      { x: 0.3, y: 0.3, r: 0.45, vx: 0.02, vy: 0.015, color: [130, 80, 255] },
      { x: 0.7, y: 0.6, r: 0.35, vx: -0.015, vy: 0.02, color: [60, 180, 255] },
      { x: 0.5, y: 0.8, r: 0.4, vx: 0.01, vy: -0.018, color: [100, 120, 255] },
    ];

    function draw(time: number) {
      const cw = canvas!.width;
      const ch = canvas!.height;
      ctx!.clearRect(0, 0, cw, ch);

      for (const orb of orbs) {
        const ox = orb.x + Math.sin(time * 0.0003 * orb.vx * 50) * 0.15;
        const oy = orb.y + Math.cos(time * 0.0003 * orb.vy * 50) * 0.15;

        const gradient = ctx!.createRadialGradient(
          ox * cw, oy * ch, 0,
          ox * cw, oy * ch, orb.r * Math.max(cw, ch)
        );
        const [r, g, b] = orb.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.12)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.04)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx!.fillStyle = gradient;
        ctx!.fillRect(0, 0, cw, ch);
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
