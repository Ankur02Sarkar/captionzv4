import { useEffect, useRef, useState } from "react";

const INTERACTIVE = "a, button, [role='button'], [data-cursor], input, textarea, select, label";

const STATE_LABELS: Record<string, string> = {
  view: "View",
  explore: "Explore",
  enter: "Enter",
  open: "Open",
  play: "Play",
  read: "Read",
  drag: "Drag",
};

/**
 * The Captionz cursor: a red point that tracks exactly, wrapped in an inertial
 * ring that reacts to what is underneath it. Disabled on touch devices and for
 * anyone who prefers reduced motion, and it never runs without a fine pointer.
 */
export function CursorLayer() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<"idle" | "link" | "label" | "text">("idle");
  const [label, setLabel] = useState("");

  // --- capability check ------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setEnabled(fine.matches && !reduce.matches);
    update();

    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  // --- tracking + states ----------------------------------------------------
  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let velocity = 0;
    let visible = false;
    let raf = 0;

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!visible) {
        visible = true;
        dot.dataset.visible = "";
        ring.dataset.visible = "";
        // Only retire the native cursor once ours is proven to be tracking.
        document.documentElement.classList.add("has-cursor");
      }

      const target = event.target as HTMLElement | null;
      const hit = target?.closest?.(INTERACTIVE) as HTMLElement | null;

      if (!hit) {
        setState("idle");
        setLabel("");
        ring.dataset.text = "";
        return;
      }

      const isText = hit.tagName === "INPUT" || hit.tagName === "TEXTAREA";
      if (isText) {
        setState("text");
        setLabel("");
        ring.dataset.text = "";
        return;
      }
      ring.dataset.text = "";
      const custom = hit.dataset?.cursor;
      if (custom && custom !== "link") {
        setState(custom === "text" ? "text" : "label");
        setLabel(
          hit.dataset?.cursorLabel ||
            STATE_LABELS[custom] ||
            custom.toUpperCase()
        );
      } else {
        setState("link");
        setLabel("");
      }
    };

    const onPointerDown = () => {
      ring.dataset.pressed = "";
      dot.dataset.pressed = "";
    };
    const onPointerUp = () => {
      delete ring.dataset.pressed;
      delete dot.dataset.pressed;
    };
    const onLeave = () => {
      visible = false;
      delete dot.dataset.visible;
      delete ring.dataset.visible;
    };
    const onEnter = () => {
      visible = true;
      dot.dataset.visible = "";
      ring.dataset.visible = "";
    };

    const render = () => {
      const lerp = 0.16;
      const prevX = ringX;
      const prevY = ringY;

      ringX += (pointerX - ringX) * lerp;
      ringY += (pointerY - ringY) * lerp;

      velocity = Math.min(1, Math.hypot(ringX - prevX, ringY - prevY) / 26);

      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${1 + velocity * 0.18})`;
      ring.style.setProperty("--cursor-speed", velocity.toFixed(3));

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled]);

  // Keep the label node in sync without re-rendering the ring transform.
  useEffect(() => {
    if (labelRef.current) labelRef.current.textContent = label;
  }, [label]);

  if (!enabled) return null;

  return (
    <div className="cursor-layer" aria-hidden="true">
      <div ref={ringRef} className="cursor-ring" data-state={state}>
        <span ref={labelRef} className="cursor-ring__label" />
      </div>
      <div ref={dotRef} className="cursor-dot" data-state={state} />
    </div>
  );
}
