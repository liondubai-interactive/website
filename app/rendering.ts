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

function settleRestoredScroll() {
  if (document.hidden) return;
  window.clearTimeout(scrollTimer);
  notifyScroll(false);
}

export function observeScrolling(listener: (scrolling: boolean) => void) {
  if (!scrollListeners.size) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", settleRestoredScroll);
    document.addEventListener("visibilitychange", settleRestoredScroll);
  }
  scrollListeners.add(listener);
  listener(scrolling);
  return () => {
    scrollListeners.delete(listener);
    if (!scrollListeners.size) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", settleRestoredScroll);
      document.removeEventListener("visibilitychange", settleRestoredScroll);
      window.clearTimeout(scrollTimer);
      scrolling = false;
    }
  };
}

// Visibility, not input focus: switching from browser chrome or an embedded preview
// does not reliably send a focus event. A visible page must not wait for a click.
export function observePageVisibility(listener: (visible: boolean) => void) {
  const sync = () => listener(!document.hidden);
  const hide = () => listener(false);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("pageshow", sync);
  window.addEventListener("pagehide", hide);
  sync();
  return () => {
    document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("pageshow", sync);
    window.removeEventListener("pagehide", hide);
  };
}
