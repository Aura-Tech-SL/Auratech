"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Locomotive-style trailing cursor: a small dot that follows the pointer with
 * spring-like easing, grows when hovering elements tagged with
 * `data-cursor="grow"` (CTAs, links, project cards). Disabled on touch
 * devices and when prefers-reduced-motion is set.
 */
export function CursorBlob() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return;
    setEnabled(true);

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Grow the ring when hovering interactive elements.
    const onOver = (e: Event) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        '[data-cursor="grow"], a, button',
      );
      ring.dataset.grow = target ? "true" : "false";
    };

    const tick = () => {
      // Dot snaps fast to the cursor; ring lags behind for the springy feel.
      dotX += (mouseX - dotX) * 0.6;
      dotY += (mouseY - dotY) * 0.6;
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        data-grow="false"
        className="pointer-events-none fixed top-0 left-0 z-[60] -ml-5 -mt-5 h-10 w-10 rounded-full border border-accent/40 transition-[width,height,margin,opacity] duration-200 ease-out data-[grow=true]:h-16 data-[grow=true]:w-16 data-[grow=true]:-ml-8 data-[grow=true]:-mt-8 data-[grow=true]:bg-accent/10 data-[grow=true]:border-accent/70"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[60] -ml-1 -mt-1 h-2 w-2 rounded-full bg-accent"
      />
    </>
  );
}
