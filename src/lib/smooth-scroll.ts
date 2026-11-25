// Inertial page scrolling.
//
// A small rAF loop that eases the window toward the wheel's target position
// instead of jumping to it. Written by hand rather than pulling in Lenis so the
// project keeps zero extra runtime dependencies.
//
// Deliberately NOT applied when:
//   - the pointer is coarse (touch devices already have real momentum, and
//     hijacking it makes a phone feel broken),
//   - the user asked for reduced motion,
//   - the scroll happens inside a nested scroll container (the summary card,
//     the admin table, the mobile drawer).

import { useEffect } from "react";

/** Higher = snappier. 0.1 lands around a 350ms settle, which reads as "weighted". */
const EASING = 0.1;
/** Below this we snap and stop the loop, to avoid a permanently running rAF. */
const SETTLE_PX = 0.35;
/** Keyboard/space scrolling steps. */
const KEY_STEP = 120;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isCoarsePointer(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

/** True when the event happened inside an element that scrolls on its own. */
function insideNestedScroller(target: EventTarget | null, deltaY: number): boolean {
  let node = target instanceof Element ? target : null;

  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    const scrolls = /(auto|scroll|overlay)/.test(style.overflowY);
    const canScroll = node.scrollHeight > node.clientHeight + 1;

    if (scrolls && canScroll) {
      const atTop = node.scrollTop <= 0;
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
      // Only defer while the inner element still has room in that direction,
      // so reaching its end hands scrolling back to the page.
      if (!(deltaY < 0 && atTop) && !(deltaY > 0 && atBottom)) return true;
    }

    node = node.parentElement;
  }

  return false;
}

export function useSmoothScroll(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion() || isCoarsePointer()) return;

    let target = window.scrollY;
    let current = window.scrollY;
    let frame = 0;
    let running = false;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const clamp = (value: number) => Math.min(Math.max(value, 0), maxScroll());

    const step = () => {
      const distance = target - current;

      if (Math.abs(distance) < SETTLE_PX) {
        current = target;
        window.scrollTo(0, current);
        running = false;
        return;
      }

      current += distance * EASING;
      window.scrollTo(0, current);
      frame = window.requestAnimationFrame(step);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(step);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.defaultPrevented) return; // pinch zoom
      if (insideNestedScroller(event.target, event.deltaY)) return;
      // Line and page deltas need converting to pixels before they mean anything.
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;

      event.preventDefault();
      target = clamp(target + event.deltaY * unit);
      start();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;

      const jump: Record<string, number> = {
        ArrowDown: KEY_STEP,
        ArrowUp: -KEY_STEP,
        PageDown: window.innerHeight * 0.9,
        PageUp: -window.innerHeight * 0.9,
        " ": event.shiftKey ? -window.innerHeight * 0.9 : window.innerHeight * 0.9,
      };

      if (event.key === "Home") {
        event.preventDefault();
        target = 0;
        start();
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        target = maxScroll();
        start();
        return;
      }

      const delta = jump[event.key];
      if (delta === undefined) return;

      event.preventDefault();
      target = clamp(target + delta);
      start();
    };

    // Anchor links, focus jumps and router navigation move the window directly;
    // resync so the next wheel tick does not yank the page back.
    const onScroll = () => {
      if (running) return;
      current = window.scrollY;
      target = window.scrollY;
    };

    const onResize = () => {
      target = clamp(target);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);
}
