"use client";

import { useEffect, useRef } from "react";
import { observeScrolling, prefersEconomyRendering } from "../rendering";

type Particle = {
  x: number; y: number;
  size: number; alpha: number; diamond: boolean;
  angle: number; speed: number; driftSpeed: number; phase: number;
};

export function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d");
    if (!context) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const hover = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const economy = prefersEconomyRendering();
    // Rasterize the two shapes once, then reuse these tiny in-memory sprites.
    const sprites = [false, true].map((diamond) => {
      const sprite = document.createElement("canvas");
      sprite.width = sprite.height = 32;
      const ctx = sprite.getContext("2d")!;
      ctx.translate(16, 16);
      ctx.scale(4, 4);
      ctx.fillStyle = "rgba(243,177,180,.12)";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgb(255,225,216)";
      ctx.beginPath();
      if (diamond) {
        ctx.moveTo(0, -1.5);
        ctx.lineTo(1, 0);
        ctx.lineTo(0, 1.5);
        ctx.lineTo(-1, 0);
        ctx.closePath();
      } else ctx.arc(0, 0, .65, 0, Math.PI * 2);
      ctx.fill();
      return sprite;
    });
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let left = 0;
    let top = 0;
    let pixelRatio = 0;
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;
    let paused = document.hidden;
    let scrolling = false;

    function draw() {
      const ctx = context!;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const half = p.size * 4;
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(sprites[p.diamond ? 1 : 0], p.x - half, p.y - half, half * 2, half * 2);
      }
      ctx.globalAlpha = 1;
    }

    function animate(time: number) {
      frame = 0;
      // requestAnimationFrame follows the display's refresh rate; speed uses elapsed time.
      const delta = lastTime ? Math.min(time - lastTime, 50) : 1000 / 60;
      lastTime = time;
      const seconds = delta / 1000;
      elapsed += seconds;
      const drag = Math.exp(-seconds / 1.3);
      for (const p of particles) {
        // Independent headings gently wander, without a shared bobbing cycle.
        p.angle += Math.sin(elapsed * .23 + p.phase) * .22 * seconds;
        p.speed = p.driftSpeed + (p.speed - p.driftSpeed) * drag;
        let vx = Math.cos(p.angle) * p.speed;
        let vy = Math.sin(p.angle) * p.speed;
        if (pointer) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < 160 * 160) {
            const distance = Math.sqrt(distanceSquared);
            const push = 480 * (1 - distance / 160) ** 2 * seconds;
            vx += distance > .1 ? dx / distance * push : Math.cos(p.angle) * push;
            vy += distance > .1 ? dy / distance * push : Math.sin(p.angle) * push;
            p.angle = Math.atan2(vy, vx);
            const speed = Math.hypot(vx, vy);
            p.speed = Math.min(200, speed);
            if (speed > 200) { vx *= 200 / speed; vy *= 200 / speed; }
          }
        }
        // The nudge changes the actual path; there is no home position or spring.
        p.x += vx * seconds;
        p.y += vy * seconds;
        const margin = 40;
        if (p.x < -margin) p.x = width + margin;
        else if (p.x > width + margin) p.x = -margin;
        if (p.y < -margin) p.y = height + margin;
        else if (p.y > height + margin) p.y = -margin;
      }
      draw();
      wake();
    }

    function wake() {
      if (!frame && !paused && !scrolling && !document.hidden && !motion.matches) {
        frame = requestAnimationFrame(animate);
      }
    }

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      pointer = null;
      draw();
    }

    function resize() {
      // Mobile browser chrome can resize the viewport repeatedly during a swipe.
      if (scrolling) return;
      const bounds = canvas.getBoundingClientRect();
      left = bounds.left;
      top = bounds.top;
      const ratio = Math.min(devicePixelRatio || 1, economy ? 1 : 1.5);
      if (width === bounds.width && height === bounds.height && pixelRatio === ratio) return;
      width = bounds.width;
      height = bounds.height;
      pixelRatio = ratio;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      let seed = 39217;
      const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
      const count = Math.min(110, Math.max(22, Math.round(width * height / 17000)));
      particles = Array.from({ length: count }, () => ({
        x: 32 + random() * Math.max(0, width - 64),
        y: 32 + random() * Math.max(0, height - 64),
        size: .8 + random() * 1.1,
        alpha: .20 + random() * .30,
        diamond: random() > .72,
        angle: random() * Math.PI * 2,
        driftSpeed: 3 + random() * 5,
        speed: 0,
        phase: random() * Math.PI * 2,
      }));
      reset();
      wake();
    }

    function leave() {
      pointer = null;
      wake();
    }

    function move(event: PointerEvent) {
      if (document.hidden || motion.matches || !hover.matches || event.pointerType === "touch") return;
      const x = event.clientX - left;
      const y = event.clientY - top;
      if (x < 0 || x > width || y < 0 || y > height) { leave(); return; }
      if (pointer) { pointer.x = x; pointer.y = y; }
      else pointer = { x, y };
      if (!frame) lastTime = 0;
      wake();
    }

    function suspend() { paused = true; reset(); }
    function resume() { paused = false; reset(); wake(); }
    function visibility() { if (document.hidden) suspend(); else resume(); }
    function preference() { reset(); wake(); }

    const resizeObserver = new ResizeObserver(resize);
    resize();
    resizeObserver.observe(canvas);
    const stopObservingScroll = observeScrolling(active => {
      scrolling = active;
      if (active) reset();
      else { resize(); wake(); }
    });
    window.addEventListener("pointermove", move, { passive: true, capture: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", suspend);
    window.addEventListener("focus", resume);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", preference);
    hover.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      stopObservingScroll();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", move, true);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", suspend);
      window.removeEventListener("focus", resume);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", preference);
      hover.removeEventListener("change", preference);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-particles" aria-hidden="true" />;
}
