import {
  createContext,
  createElement,
  useContext,
  type ElementType,
  type ReactNode,
} from "react";
import { useInView } from "../../hooks/useInView";

type RevealVariant = "up" | "mask" | "gate" | "fade" | "scale";
type RevealAs = "div" | "section" | "article" | "li" | "span" | "figure" | "p";

/**
 * Render every descendant Reveal already in its final state, skipping the
 * entrance animation. Used when a page is handed over from another layer
 * (home veil → case studies) so the swap doesn't visibly restart.
 */
export const RevealImmediateContext = createContext(false);

interface RevealProps {
  children?: ReactNode;
  /** Motion treatment used when the element enters the viewport. */
  variant?: RevealVariant;
  /** Stagger in seconds, applied as an animation delay. */
  delay?: number;
  className?: string;
  as?: RevealAs;
  style?: React.CSSProperties;
  id?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

/**
 * Scroll-entry wrapper. Elements start hidden through CSS and receive
 * `data-visible` once they cross into the viewport; the actual motion lives
 * in `app.css` so `prefers-reduced-motion` can disable it in one place.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
  as = "div",
  style,
  ...rest
}: RevealProps) {
  const immediate = useContext(RevealImmediateContext);
  const { ref, inView } = useInView<HTMLElement>();

  return createElement(
    as as ElementType,
    {
      ref,
      className: className || undefined,
      "data-reveal": variant,
      "data-visible": immediate || inView ? "" : undefined,
      style: delay ? { ...style, "--reveal-delay": `${delay}s` } : style,
      ...rest,
    },
    children
  );
}
