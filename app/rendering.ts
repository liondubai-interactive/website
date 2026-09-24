// Conservative browser hints, not a hardware benchmark. Unsupported hints are ignored.
export function prefersEconomyRendering() {
  const device = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return device.connection?.saveData === true ||
    (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4) ||
    (device.deviceMemory !== undefined && device.deviceMemory <= 4);
}

// One passive listener for all decorative animations; no React renders on scroll.
const scrollListeners = new Set<(scrolling: boolean) => void>();
let scrolling = false;
let scrollTimer = 0;

function notifyScroll(active: boolean) {
  if (scrolling === active) return;
  scrolling = active;
  for (const listener of scrollListeners) listener(active);
}

function onScroll() {
  notifyScroll(true);
  window.clearTimeout(scrollTimer);
  // Also covers momentum scrolling in browsers without scrollend support.
  scrollTimer = window.setTimeout(() => notifyScroll(false), 150);
}

export function observeScrolling(listener: (scrolling: boolean) => void) {
  if (!scrollListeners.size) window.addEventListener("scroll", onScroll, { passive: true });
  scrollListeners.add(listener);
  listener(scrolling);
  return () => {
    scrollListeners.delete(listener);
    if (!scrollListeners.size) {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(scrollTimer);
      scrolling = false;
    }
  };
}
