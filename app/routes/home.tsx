import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { Topbar } from "../components/Navigation/Topbar";
import { OverlayMenu } from "../components/Navigation/OverlayMenu";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { CaseStudyIndex } from "../components/CaseStudy/CaseStudyIndex";
import { RevealImmediateContext } from "../components/Motion/Reveal";
import { getDatabase } from "../db/getDb";
import { emptyCaseStudyIndex, getCaseStudyIndex } from "../lib/case-studies";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Captionz — Gateway of Branding" },
    {
      name: "description",
      content:
        "Captionz is a strategic branding and design studio. Every project is a gateway to a new level of brand thinking.",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = getDatabase(context);
  if (!db) return { preview: emptyCaseStudyIndex() };
  return { preview: await getCaseStudyIndex(db, { page: 1, category: "all", q: "" }) };
}

/** Fraction of the veil that must be lifted before the hand-off completes. */
const HANDOFF_AT = 0.8;
const HANDOFF_MS = 470;

const noUrls = () => "#";

export default function Home({ loaderData }: Route.ComponentProps) {
  const { preview } = loaderData;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const cueFillRef = useRef<HTMLElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handoffTimerRef = useRef<number | null>(null);
  const latchedRef = useRef(false);
  const isStatementOpenRef = useRef(false);
  const isMenuOpenRef = useRef(isMenuOpen);

  const navigate = useNavigate();
  const reduced = useReducedMotion();

  // A fresh visit always starts with the veil down. Without this, going back
  // from /case-study would restore a mid-reveal scroll position and instantly
  // fire the hand-off again.
  useEffect(() => {
    window.scrollTo(0, 0);
    const frame = window.requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
    if (isMenuOpen) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      isStatementOpenRef.current = false;
      setIsStatementOpen(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleMouseMove = () => {
      if (isMenuOpenRef.current) return;

      if (!isStatementOpenRef.current) {
        isStatementOpenRef.current = true;
        setIsStatementOpen(true);
      }

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = setTimeout(() => {
        isStatementOpenRef.current = false;
        setIsStatementOpen(false);
      }, 5000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
        }
        isStatementOpenRef.current = false;
        setIsStatementOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  /**
   * The veil is lifted by real scroll. Once 80% of the case-study page is
   * standing, the last fifth is finished on a short transition, the document
   * is returned to the top (invisible — the viewport is already all peek) and
   * the route is swapped for the real /case-study page.
   */
  useEffect(() => {
    if (reduced) return;

    const veil = veilRef.current;
    if (!veil) return;

    let frame = 0;

    const finish = (progress: number) => {
      if (latchedRef.current) return;
      latchedRef.current = true;

      const remaining = Math.max(0, 1 - progress);

      if (remaining > 0.002) {
        veil.style.transition = "transform 420ms cubic-bezier(0.65, 0, 0.2, 1)";
        veil.style.transform = `translate3d(0, ${-remaining * 100}%, 0)`;
      }

      handoffTimerRef.current = window.setTimeout(
        () => {
          veil.style.transition = "none";
          veil.style.transform = "translate3d(0, -100%, 0)";
          window.scrollTo(0, 0);
          navigate("/case-study", { state: { seamless: true } });
        },
        remaining > 0.002 ? HANDOFF_MS : 40
      );
    };

    const onScroll = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (latchedRef.current || isMenuOpenRef.current) return;

        const height = veil.offsetHeight || window.innerHeight;
        const progress = Math.min(1, Math.max(0, window.scrollY / height));

        if (cueFillRef.current) {
          cueFillRef.current.style.transform = `scaleY(${progress})`;
        }

        if (progress >= HANDOFF_AT) finish(progress);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      if (handoffTimerRef.current) {
        window.clearTimeout(handoffTimerRef.current);
        handoffTimerRef.current = null;
      }
    };
  }, [navigate, reduced]);

  const handlePageClick = (e: React.MouseEvent) => {
    if (isMenuOpen) return;
    // Once the veil is moving, a click belongs to the scroll story, not the menu.
    if (window.scrollY > 12) return;

    // Don't trigger if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    const target = e.target as HTMLElement | null;
    // Links, the menu toggle, the overlay and the page body below the fold
    // all keep their own behaviour.
    if (
      target?.closest("a") ||
      target?.closest("button") ||
      target?.closest(".menu-toggle") ||
      target?.closest(".overlay-menu") ||
      target?.closest(".global-back-btn") ||
      target?.closest(".home-peek")
    ) {
      return;
    }

    setIsMenuOpen(true);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused && video.currentTime > 0) {
      setIsPlaying(true);
    }

    const handlePlaying = () => setIsPlaying(true);
    video.addEventListener("playing", handlePlaying);

    const playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {
        // Autoplay blocked; the poster remains gracefully visible
      });
    }

    return () => {
      video.removeEventListener("playing", handlePlaying);
    };
  }, []);

  return (
    <div className="reveal-root home-page" onClick={handlePageClick}>
      <OverlayMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="home-veil" ref={veilRef}>
        <Topbar
          variant="home"
          isOpen={isMenuOpen}
          onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
        />

        <section className="home-hero">
          <img
            className="home-hero__poster"
            src="/assets/home-poster.jpg"
            alt="A figure walks across a marble floor toward the large red Captionz gateway, set beneath a bright, cloud-filled sky."
          />
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/assets/home-poster.jpg"
            aria-hidden="true"
            className={isPlaying ? "is-playing" : ""}
            onPlaying={() => setIsPlaying(true)}
          >
            <source src="/assets/home-animation.mp4" type="video/mp4" />
          </video>
          <div className="home-hero__scrim" />

          <div className="home-hero__stage">
            <div className={`hero-statement ${isStatementOpen ? "is-open" : ""}`}>
              <h1>
                <button
                  className="step-trigger"
                  type="button"
                  aria-expanded={isStatementOpen}
                  aria-describedby="stepReveal"
                  onFocus={() => setIsStatementOpen(true)}
                  onClick={() => setIsMenuOpen(true)}
                  data-cursor="enter"
                  data-cursor-label="Enter"
                >
                  Step into the <em>gateway</em> of branding — Captionz
                </button>
              </h1>
              <p className="step-reveal" id="stepReveal">
                Captionz is a strategic branding and design studio. We take businesses from where
                they stand today to the identity they're capable of — one deliberate threshold at a
                time.
              </p>
            </div>
          </div>

          <Link
            to="/case-study"
            className="home-scrollcue"
            data-cursor="enter"
            data-cursor-label="Case Studies"
            aria-label="Skip ahead to Case Studies"
          >
            <span>Case Studies</span>
            <i aria-hidden="true">
              <b ref={cueFillRef} />
            </i>
          </Link>
        </section>
      </div>

      {/*
        The destination, waiting underneath the veil. It is the real case-study
        index — same component, same data — so once the route changes nothing
        moves. Inert: it cannot be clicked, focused or read while it is scenery.
      */}
      <div className="home-peek" aria-hidden="true" inert>
        <RevealImmediateContext.Provider value={true}>
          <ShellLayout activeSection="case-study">
            <main className="main">
              <CaseStudyIndex
                data={preview}
                view="grid"
                makeUrl={noUrls}
                showPagination={false}
              />
            </main>
          </ShellLayout>
        </RevealImmediateContext.Provider>
      </div>

      <div className="home-pull-room" aria-hidden="true" />
    </div>
  );
}
