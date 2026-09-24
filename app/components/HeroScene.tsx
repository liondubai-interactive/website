"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";

export function HeroScene() {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const container = host.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let viewer: ModelViewerElement | undefined;
    let visible = false;
    let started = false;
    let disposed = false;

    function syncPlayback() {
      if (!viewer?.loaded) return;
      const play = visible && !document.hidden && !motion.matches;
      if (play) viewer.play();
      else viewer.pause();
    }

    function showFallback() {
      if (disposed) return;
      viewer?.pause();
      viewer?.remove();
      viewer = undefined;
      setStatus("failed");
    }

    async function load() {
      started = true;
      try {
        // Loaded only on Home, once the scene enters the viewport. No CDN scripts.
        await import("@google/model-viewer");
        if (disposed) return;
        const scene = document.createElement("model-viewer");
        // The viewer's keyboard control lives inside its shadow root.
        const focusStyle = document.createElement("style");
        focusStyle.textContent = ":focus { outline: none; }";
        scene.shadowRoot?.append(focusStyle);
        viewer = scene;
        viewer.src = "/models/hero-v4.glb";
        viewer.alt = "Floating laptop, phone and TikTok coins. Drag or use arrow keys to rotate.";
        viewer.cameraControls = true;
        viewer.disableZoom = true;
        viewer.disablePan = true;
        viewer.disableTap = true;
        viewer.touchAction = "pan-y";
        viewer.cameraOrbit = "15deg 72deg 105%";
        viewer.minCameraOrbit = "auto 45deg auto";
        viewer.maxCameraOrbit = "auto 105deg auto";
        viewer.fieldOfView = "25deg";
        viewer.interactionPrompt = "none";
        viewer.shadowIntensity = 0;
        viewer.exposure = 1.15;
        viewer.addEventListener("load", async () => {
          // Settle the camera before revealing the first rendered frame.
          if (disposed || viewer !== scene) return;
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
      if (visible && !started) void load();
      syncPlayback();
    });
    observer.observe(container);
    document.addEventListener("visibilitychange", syncPlayback);
    motion.addEventListener("change", syncPlayback);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      motion.removeEventListener("change", syncPlayback);
      viewer?.pause();
      viewer?.remove();
    };
  }, []);

  return (
    <div className="hero-visual" ref={host} data-ready={status === "ready"}>
      {status === "failed" && <Image className="hero-poster" src="/models/hero-v4.webp" alt="A floating laptop, phone and gold TikTok coins" width={800} height={726} unoptimized />}
    </div>
  );
}
