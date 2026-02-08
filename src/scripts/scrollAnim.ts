/*
 * Scroll-triggered animations using data attributes and Intersection Observer
 * Detects scroll position or when an element leaves view
 */

if (typeof window !== "undefined") {
  const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

  function run() {
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    const scrollThresholdEls = document.querySelectorAll<HTMLElement>("[data-scroll-threshold]");
    const sentinelEls = document.querySelectorAll<HTMLElement>("[data-sentinel]");

    // Scroll threshold update
    if (scrollThresholdEls.length > 0) {
      let rafId: number | null = null;
      const state = new Map<HTMLElement, boolean>();

      function update() {
        const scrollY = window.scrollY;
        scrollThresholdEls.forEach((el) => {
          const threshold = Number(el.dataset.scrollThreshold) || 48;
          const scrolled = scrollY > threshold;
          if (state.get(el) !== scrolled) {
            state.set(el, scrolled);
            el.setAttribute("data-scrolled", scrolled ? "true" : "false");
          }
        });
        rafId = null;
      }

      function onScroll() {
        if (rafId === null) rafId = requestAnimationFrame(update);
      }

      window.addEventListener("scroll", onScroll, { passive: true });
      update();
    }

    // Element leave view update 
    if (sentinelEls.length > 0) {
      const bySelector = new Map<string, HTMLElement[]>();
      sentinelEls.forEach((el) => {
        const sel = (el.dataset.sentinel || "").trim();
        if (!sel) return;
        if (!bySelector.has(sel)) bySelector.set(sel, []);
        bySelector.get(sel)!.push(el);
      });

      // Update data-past-sentinel on each subscriber
      bySelector.forEach((subscribers, selector) => {
        const sentinel = document.querySelector(selector);
        if (!sentinel) return;

        subscribers.forEach((el) => el.setAttribute("data-past-sentinel", "false"));

        const observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (!entry) return;
            const past = !entry.isIntersecting;
            subscribers.forEach((el) =>
              el.setAttribute("data-past-sentinel", past ? "true" : "false")
            );
          },
          { root: null, rootMargin: "0px", threshold: 0 }
        );
        observer.observe(sentinel);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  document.addEventListener("astro:page-load", run);
}
