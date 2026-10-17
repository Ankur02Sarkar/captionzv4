import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigation, useNavigate, useNavigationType } from "react-router";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type Phase = "idle" | "closing" | "covering" | "opening";

const CLOSE_MS = 440;
const OPEN_MS = 620;
/** Failsafe: never hold the gate shut longer than this waiting on a loader. */
const COVER_TIMEOUT_MS = 4000;

interface GateContextValue {
  /** True while the gate is covering the screen. */
  isTransitioning: boolean;
  /** Navigate through the gate on purpose. */
  navigateThroughGate: (to: string) => void;
}

const GateContext = createContext<GateContextValue>({
  isTransitioning: false,
  navigateThroughGate: () => {},
});

export function useGate() {
  return useContext(GateContext);
}

function isPlainLeftClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * The Gate Cut: every real page change passes through the Captionz doorway.
 * Two red leaves close across the viewport, the route swaps behind them, then
 * they part to reveal the next page. Filter, sort and pagination changes stay
 * on the same path and are left alone.
 */
export function GateTransition({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const navigationType = useNavigationType();
  const location = useLocation();
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const coveringRef = useRef(false);
  /** Set for click-driven journeys: the new page should open at its top. */
  const resetScrollRef = useRef(false);
  /** Nothing gets to scroll while the leaves are shut. */
  const scrollHome = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  // --- body scroll lock + a flag other components can read --------------------
  useEffect(() => {
    const busy = phase !== "idle";
    document.documentElement.dataset.gate = phase;

    if (busy) {
      document.body.classList.add("gate-active");
    } else {
      document.body.classList.remove("gate-active");
    }
  }, [phase]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const runOpen = useCallback(() => {
    setPhase("opening");
    later(() => setPhase("idle"), OPEN_MS + 60);
  }, [later]);

  const runClose = useCallback(
    (to: string) => {
      if (reduced) {
        navigate(to);
        return;
      }

      clearTimers();
      coveringRef.current = true;
      resetScrollRef.current = true;
      setPhase("closing");

      later(() => {
        navigate(to);
        setPhase("covering");
      }, CLOSE_MS);
    },
    [clearTimers, later, navigate, reduced]
  );

  const navigateThroughGate = useCallback(
    (to: string) => {
      const url = new URL(to, window.location.href);
      const samePath = url.pathname === window.location.pathname;
      if (samePath) {
        navigate(to);
        return;
      }
      runClose(to);
    },
    [navigate, runClose]
  );

  // --- open beat: as soon as the destination has rendered ---------------------
  useEffect(() => {
    if (phase !== "covering") return;

    if (navigation.state === "idle") {
      // The new page opens at its head, while the leaves still hide it.
      if (resetScrollRef.current) {
        resetScrollRef.current = false;
        scrollHome();
      }
      runOpen();
      return;
    }

    const failsafe = setTimeout(() => {
      if (coveringRef.current) runOpen();
    }, COVER_TIMEOUT_MS);

    return () => clearTimeout(failsafe);
  }, [phase, navigation.state, runOpen, scrollHome, location.pathname]);

  // --- back / forward still gets the doorway ---------------------------------
  useEffect(() => {
    const onPopState = () => {
      if (reduced) return;
      clearTimers();
      coveringRef.current = true;
      // History keeps its own scroll memory; don't fight it.
      resetScrollRef.current = false;
      setPhase("covering");
      later(runOpen, 90);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [clearTimers, later, reduced, runOpen]);

  // --- reduced motion: no leaves, but still arrive at the top -----------------
  useEffect(() => {
    if (!reduced) return;
    if (navigationType === "POP" || location.hash) return;
    scrollHome();
  }, [location.key, location.hash, navigationType, reduced, scrollHome]);

  // --- intercept internal links ----------------------------------------------
  useEffect(() => {
    if (reduced) return;

    const onClick = (event: MouseEvent) => {
      if (!isPlainLeftClick(event) || event.defaultPrevented) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      if (
        anchor.dataset.noGate !== undefined ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      // Same document path: filters, pagination and view switches move quietly.
      if (url.pathname === window.location.pathname) return;

      // Modifier opens in the browser's hands, and .html aliases behave like
      // their clean equivalent so the rail stays consistent.
      event.preventDefault();
      const to = `${url.pathname}${url.search}${url.hash}`;
      runClose(to);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [runClose, reduced]);

  const isTransitioning = phase !== "idle";

  return (
    <GateContext.Provider value={{ isTransitioning, navigateThroughGate }}>
      {children}
      {!reduced && (
        <div className="gate-overlay" data-phase={phase} aria-hidden="true">
          <div className="gate-overlay__leaf gate-overlay__leaf--left" />
          <div className="gate-overlay__leaf gate-overlay__leaf--right" />
          <div className="gate-overlay__lintel" />
          <div className="gate-overlay__seam" />
          <div className="gate-overlay__mark">
            <img src="/assets/gateway-icon.png" alt="" />
          </div>
        </div>
      )}
    </GateContext.Provider>
  );
}
