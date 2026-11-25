// Tactile CTA button.
//
// This is the brand-fitted adaptation of the "liquid metal" button: it keeps
// the parts that make that button feel expensive — a layered elevation stack,
// a real press that sinks the surface, a click ripple from the cursor point,
// and a spring-ish easing curve — but paints them with our navy/gold palette
// and plain CSS instead of a WebGL shader. No extra runtime dependency, works
// with SSR, and stays legible on a payment funnel.
//
// Visual sheen lives in styles.css under `.btn-tactile`.

import { Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import type React from "react";

import { cn } from "@/lib/utils";

type Tone = "gold" | "ink";

type Ripple = { id: number; x: number; y: number; size: number };

const RIPPLE_MS = 620;

/** Shared press/ripple plumbing for both the button and the link variants. */
function useTactile() {
  const [ripples, setRipples] = useState<Array<Ripple>>([]);
  const nextId = useRef(0);

  const spawn = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const host = event.currentTarget;
    const rect = host.getBoundingClientRect();
    // Keyboard "clicks" report 0,0 — ripple from the centre instead of a corner.
    const fromKeyboard = event.detail === 0;
    const x = fromKeyboard ? rect.width / 2 : event.clientX - rect.left;
    const y = fromKeyboard ? rect.height / 2 : event.clientY - rect.top;
    // Big enough to always cover the far corner of the button.
    const size = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y)) * 2;
    const id = nextId.current++;

    setRipples((prev) => [...prev, { id, x, y, size }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, RIPPLE_MS);
  }, []);

  const nodes = ripples.map((ripple) => (
    <span
      key={ripple.id}
      className="btn-tactile-ripple"
      style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
    />
  ));

  return { spawn, nodes };
}

function toneClass(tone: Tone) {
  return tone === "ink" ? "btn-tactile-ink" : "btn-tactile-gold";
}

export function TactileButton({
  tone = "gold",
  className,
  children,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  const { spawn, nodes } = useTactile();

  return (
    <button
      {...rest}
      className={cn("btn-tactile", toneClass(tone), className)}
      onClick={(event) => {
        spawn(event);
        onClick?.(event);
      }}
    >
      <span className="btn-tactile-label">{children}</span>
      {nodes}
    </button>
  );
}

type TactileLinkProps = React.ComponentProps<typeof Link> & { tone?: Tone };

export function TactileLink({ tone = "gold", className, children, ...rest }: TactileLinkProps) {
  const { spawn, nodes } = useTactile();

  return (
    <Link
      {...(rest as TactileLinkProps)}
      className={cn("btn-tactile", toneClass(tone), className as string)}
      onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
        spawn(event);
        rest.onClick?.(event as never);
      }}
    >
      <span className="btn-tactile-label">{children}</span>
      {nodes}
    </Link>
  );
}
