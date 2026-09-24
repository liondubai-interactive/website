"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { observeScrolling, prefersEconomyRendering } from "../rendering";

export function HeroScene() {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const container = host.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const hover = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const economy = prefersEconomyRendering();
    let viewer: ModelViewerElement | undefined;
    let visible = false;
    let started = false;
    let disposed = false;
    let focused = true;
    let scrolling = false;

    function syncQuality() {
      if (!viewer) return;
      const dpr = devicePixelRatio || 1;
      const pixelLimit = economy ? 1.5 : !hover.matches ? 2 : dpr;
      const scale = !economy && hover.matches && innerWidth >= 800 && dpr <= 1.5
        ? 1.25 : Math.min(1, pixelLimit / dpr);
      viewer.style.setProperty("--render-scale", String(scale));
      viewer.style.setProperty("--render-inverse", String(1 / scale));
    }

    function syncPlayback() {
      if (!started && visible && !scrolling && !document.hidden) void load();
      if (!viewer?.loaded) return;
      const play = visible && focused && !scrolling && !document.hidden && !motion.matches;
      if (play) {
        container.setAttribute("data-moving", "true");
        if (viewer.paused) viewer.play();
      } else {
        container.removeAttribute("data-moving");
        viewer.pause();
      }
    }

    function showFallback() {
      if (disposed) return;
      viewer?.pause();
      container.removeAttribute("data-moving");
      viewer?.remove();
      viewer = undefined;
      setStatus("failed");
    }

    async function load() {
      started = true;
      try {
        // Hero model loads only on Home; the renderer is shared with the header emblem.
        await import("@google/model-viewer");
        if (disposed) return;
        if (!visible || scrolling || document.hidden) { started = false; return; }
        const scene = document.createElement("model-viewer");
        // The viewer's keyboard control lives inside its shadow root.
        const focusStyle = document.createElement("style");
        focusStyle.textContent = ":focus { outline: none; }";
        scene.shadowRoot?.append(focusStyle);
        // Panning is disabled; its default invisible marker can intercept drags.
        const panTarget = document.createElement("span");
        panTarget.slot = "pan-target";
        panTarget.hidden = true;
        scene.append(panTarget);
        viewer = scene;
        syncQuality();
        viewer.src = "/models/hero-v30.glb";
        viewer.alt = "Floating laptop, phone, TikTok coin, Twitch crystal, gift box and subscription star, KICKs gem and YouTube Jewel. Drag or use arrow keys to rotate.";
        viewer.cameraControls = true;
        viewer.disableZoom = true;
        viewer.disablePan = true;
        viewer.disableTap = true;
        viewer.touchAction = "pan-y";
        // Preserve the approved device framing when the floating symbols shrink.
        viewer.cameraOrbit = "15deg 72deg 20.918126904156477m";
        viewer.cameraTarget = "0.16429230370590275m 2.0815756965352126m 0.03334959517932479m";
        viewer.minCameraOrbit = "auto 45deg auto";
        viewer.maxCameraOrbit = "auto 105deg auto";
        viewer.fieldOfView = "25deg";
        viewer.interactionPrompt = "none";
        viewer.animationCrossfadeDuration = 0;
        viewer.shadowIntensity = 0;
        viewer.environmentImage = "legacy";
        viewer.exposure = 1.15;
        viewer.addEventListener("load", async () => {
          // Settle the camera before revealing the first rendered frame.
          if (disposed || viewer !== scene) return;
          scene.animationName = scene.availableAnimations[0];
          scene.jumpCameraToGoal();
          await scene.updateComplete;
          if (disposed || viewer !== scene) return;
          setStatus("ready");
          syncPlayback();
        });
        viewer.addEventListener("error", showFallback);
        container.append(viewer);
      } catch {
        showFallback();
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(container);
    const stopObservingScroll = observeScrolling(active => { scrolling = active; syncPlayback(); });
    function blur() { focused = false; syncPlayback(); }
    function focus() { focused = true; syncPlayback(); }
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    window.addEventListener("resize", syncQuality);
    hover.addEventListener("change", syncQuality);
    document.addEventListener("visibilitychange", syncPlayback);
    motion.addEventListener("change", syncPlayback);
    return () => {
      disposed = true;
      stopObservingScroll();
      observer.disconnect();
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      window.removeEventListener("resize", syncQuality);
      hover.removeEventListener("change", syncQuality);
      document.removeEventListener("visibilitychange", syncPlayback);
      motion.removeEventListener("change", syncPlayback);
      viewer?.pause();
      viewer?.remove();
    };
  }, []);

  return (
    <div className="hero-visual" ref={host} data-ready={status === "ready"}>
      {status === "failed" && <Image className="hero-poster" src="/models/hero-v30.webp" alt="A floating laptop and phone with TikTok, Twitch, Kick and YouTube symbols" width={800} height={760} unoptimized />}
    </div>
  );
}
