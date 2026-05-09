"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HeroVideoProps {
  src: string;
  poster: string;
  className?: string;
}

/**
 * Background video for hero sections. Autoplays muted + looped, falls back to
 * the poster image when the user has prefers-reduced-motion enabled or when
 * the section is fully scrolled past (saves CPU on long pages).
 *
 * Safari quirks handled:
 * - React's `muted` prop sets the property post-mount, but Safari checks the
 *   HTML attribute at render time and refuses autoplay if it's missing. We
 *   set `muted` + `defaultMuted` imperatively before calling `play()`.
 * - The source file is encoded without an audio track so Low Power Mode
 *   doesn't block autoplay.
 * - `webkit-playsinline` (legacy) is required for iOS Safari < 13.
 */
export function HeroVideo({ src, poster, className }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force the muted attribute imperatively so Safari sees it before deciding
    // whether to allow autoplay. React's prop alone is not enough.
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    if (reducedMotion) {
      video.pause();
      return;
    }

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          /* autoplay blocked — poster remains visible */
        });
      }
    };

    // Pause when off-screen so the video doesn't keep rendering frames
    // mid-scroll on a long page.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay();
        else video.pause();
      },
      { threshold: 0.1 },
    );
    observer.observe(video);

    // Some Safari versions don't auto-fire autoplay until the video is
    // explicitly told to play once after metadata load.
    video.addEventListener("loadedmetadata", tryPlay, { once: true });
    tryPlay();

    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", tryPlay);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        className={cn("absolute inset-0 w-full h-full object-cover", className)}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      poster={poster}
      preload="auto"
      aria-hidden="true"
      className={cn("absolute inset-0 w-full h-full object-cover", className)}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
