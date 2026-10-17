import { useEffect, useRef, useState } from "react";
import { useInView } from "../../hooks/useInView";

interface CountUpProps {
  value: string;
  durationMs?: number;
  className?: string;
}

const NUMBER = /(-?\d[\d,]*\.?\d*)/;

/**
 * Animates the numeric part of a metric while leaving any words, signs or
 * suffixes untouched — "3-Year" counts 0 → 3, "Founder → Brand" stays static.
 */
export function CountUp({ value, durationMs = 1100, className }: CountUpProps) {
  // Keep the numeric fragment as a primitive so the effect below has stable
  // dependencies — a fresh `match` array every render would restart the
  // animation on each frame and the counter would never advance.
  const numeric = value.match(NUMBER)?.[1] ?? null;
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.5 });
  const [display, setDisplay] = useState(() => (numeric ? value.replace(NUMBER, "0") : value));
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!numeric) return;
    if (!inView) return;

    const target = parseFloat(numeric.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;

    const decimals = (numeric.split(".")[1] || "").length;
    const grouped = numeric.includes(",");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 0 : durationMs;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      // easeOutExpo — fast start, soft landing
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * eased;

      let text = current.toFixed(decimals);
      if (grouped) {
        text = Number(text).toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      }

      setDisplay(value.replace(numeric, text));

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [inView, numeric, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
