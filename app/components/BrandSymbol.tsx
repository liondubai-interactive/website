"use client";

/* eslint-disable @next/next/no-img-element -- Crisp vector fallback for the small 3D emblem. */
import { useEffect, useRef } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { prefersEconomyRendering } from "../rendering";

export function BrandSymbol() {
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = host.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const device = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (device.connection?.saveData) return;
    const economy = prefersEconomyRendering();
    let viewer: ModelViewerElement | undefined;
    let started = false;
    let visible = false;
    let disposed = false;
    let frame = 0;
    let lastTime = 0;
    let nextPaint = 0;
    let elapsed = 0;

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      nextPaint = 0;
      container.removeAttribute("data-moving");
    }
    function tick(time: number) {
      frame = 0;
      if (disposed || !viewer?.loaded || !viewer.duration) return;
      if (!visible || document.hidden || motion.matches) { syncPlayback(); return; }
      if (lastTime) elapsed += (time - lastTime) / 1000;
      lastTime = time;
      const interval = 1000 / 30;
      if (time >= nextPaint) {
        viewer.currentTime = viewer.duration - (elapsed % viewer.duration);
        nextPaint = time + interval - (nextPaint ? (time - nextPaint) % interval : 0);
      }
      frame = requestAnimationFrame(tick);
    }

    function quality() {
      if (!viewer) return;
      // Supersample small 1x displays; keep native resolution when the browser zooms.
      const scale = economy ? 1 : Math.max(1, 2 / (devicePixelRatio || 1));
      viewer.style.setProperty("--brand-render-scale", String(scale));
      viewer.style.setProperty("--brand-render-inverse", String(1 / scale));
    }
    function syncPlayback() {
      if (disposed) return;
      if (!visible || document.hidden || motion.matches) {
        stop();
        viewer?.pause();
        if (motion.matches) container.removeAttribute("data-ready");
        return;
      }
      if (!started) void load();
      else if (viewer?.loaded && viewer.duration > 0) {
        container.setAttribute("data-ready", "true");
        container.setAttribute("data-moving", "true");
        // Seek the native renderer at 30 fps instead of animating at monitor refresh rate.
        if (!frame) frame = requestAnimationFrame(tick);
      }
    }
    function fallback() {
      stop();
      viewer?.pause();
      viewer?.remove();
      viewer = undefined;
      container.removeAttribute("data-ready");
    }
    async function load() {
      started = true;
      try {
        // Shared with HeroScene: the package is loaded once, not once per model.
        await import("@google/model-viewer");
        if (disposed) return;
        const scene = document.createElement("model-viewer");
        viewer = scene;
        scene.src = "/models/brand-symbol-v1.glb";
        scene.setAttribute("aria-hidden", "true");
        scene.tabIndex = -1;
        scene.loading = "eager";
        scene.cameraOrbit = "0deg 90deg 2.42m";
        scene.cameraTarget = "0m -0.003m 0m";
        scene.fieldOfView = "25deg";
        scene.interactionPrompt = "none";
        scene.animationCrossfadeDuration = 0;
        scene.shadowIntensity = 0;
        scene.exposure = 1;
        quality();
        scene.addEventListener("load", async () => {
          if (disposed || viewer !== scene) return;
          scene.animationName = scene.availableAnimations[0];
          scene.jumpCameraToGoal();
          await scene.updateComplete;
          if (!disposed && viewer === scene) syncPlayback();
        });
        scene.addEventListener("error", fallback);
        container.append(scene);
      } catch { if (!disposed) fallback(); }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(container);
    document.addEventListener("visibilitychange", syncPlayback);
    window.addEventListener("pageshow", syncPlayback);
    window.addEventListener("focus", syncPlayback);
    window.addEventListener("resize", quality);
    motion.addEventListener("change", syncPlayback);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      window.removeEventListener("pageshow", syncPlayback);
      window.removeEventListener("focus", syncPlayback);
      window.removeEventListener("resize", quality);
      motion.removeEventListener("change", syncPlayback);
      fallback();
    };
  }, []);

  return <span ref={host} className="brand-symbol" aria-hidden="true">
    <img src="/brands/liondubai-symbol-white.svg" alt="" width="40" height="43" />
  </span>;
}
