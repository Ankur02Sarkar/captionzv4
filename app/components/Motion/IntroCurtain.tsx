import { useEffect, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const SEEN_KEY = "captionz.gateway-seen";
const PLAY_MS = 1180;
const LEAVE_MS = 640;

const WORDMARK: Array<{ letter: string; gate?: boolean }> = [
  { letter: "C" },
  { gate: true, letter: "" },
  { letter: "P" },
  { letter: "T" },
  { letter: "I" },
  { letter: "O" },
  { letter: "N" },
  { letter: "Z" },
];

/**
 * The Logo Cut — a once-per-session overture. The gate mark settles, the
 * wordmark rises letter by letter, a red rule draws under it, and then the
 * curtain parts down the middle with the site already waiting behind it.
 */
export function IntroCurtain() {
  const reduced = useReducedMotion();
  const [shouldPlay, setShouldPlay] = useState(false);
  const [state, setState] = useState<"idle" | "playing" | "leaving">("idle");

  // Decide once whether this session still owes the visitor the overture.
  useEffect(() => {
    if (reduced || typeof window === "undefined") return;

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }

    if (!seen) setShouldPlay(true);
  }, [reduced]);

  // Playback. Re-running this effect simply restarts the same timeline, so it
  // stays correct through StrictMode's double-invoked effects and remounts.
  useEffect(() => {
    if (!shouldPlay) return;

    setState("playing");

    const toLeave = window.setTimeout(() => {
      setState("leaving");
      try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* private mode — the overture simply plays again next time */
      }
    }, PLAY_MS);

    const toDone = window.setTimeout(() => setState("idle"), PLAY_MS + LEAVE_MS);

    return () => {
      window.clearTimeout(toLeave);
      window.clearTimeout(toDone);
    };
  }, [shouldPlay]);

  // Any deliberate interaction moves the story along immediately.
  useEffect(() => {
    if (state !== "playing") return;

    const skip = () => setState("leaving");

    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("wheel", skip, { once: true, passive: true });
    window.addEventListener("keydown", skip, { once: true });

    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [state]);

  useEffect(() => {
    if (state !== "leaving") return;
    const done = window.setTimeout(() => setState("idle"), LEAVE_MS);
    return () => window.clearTimeout(done);
  }, [state]);

  if (state === "idle") return null;

  return (
    <div className="intro-curtain" data-state={state} aria-hidden="true">
      <div className="intro-curtain__leaf intro-curtain__leaf--left" />
      <div className="intro-curtain__leaf intro-curtain__leaf--right" />

      <div className="intro-curtain__stage">
        <img className="intro-curtain__gate" src="/assets/gateway-icon.png" alt="" />

        <div className="intro-curtain__word">
          <span className="sr-only">Captionz</span>
          {WORDMARK.map((item, index) =>
            item.gate ? (
              <span
                key="gate"
                className="intro-curtain__letter intro-curtain__letter--mark"
                style={{ "--i": index } as React.CSSProperties}
                aria-hidden="true"
              >
                <img src="/assets/gateway-icon.png" alt="" />
              </span>
            ) : (
              <span
                key={item.letter}
                className="intro-curtain__letter"
                style={{ "--i": index } as React.CSSProperties}
                aria-hidden="true"
              >
                {item.letter}
              </span>
            )
          )}
        </div>

        <span className="intro-curtain__rule" />
        <span className="intro-curtain__tag">Gateway of Branding</span>
      </div>

      <span className="intro-curtain__seam" />
    </div>
  );
}
