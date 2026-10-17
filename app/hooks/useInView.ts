import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Fraction of the element that must be visible before it counts as in view. */
  threshold?: number;
  /** Extra space around the viewport so reveals start slightly before entry. */
  rootMargin?: string;
  /** Keep the "in view" state once triggered (default) instead of toggling. */
  once?: boolean;
}

/**
 * Small IntersectionObserver helper used by the scroll-reveal system.
 * Returns a ref to attach and whether the element has entered the viewport.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.18,
  rootMargin = "0px 0px -8% 0px",
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IO (older browsers / SSR hydration edge): show everything.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
