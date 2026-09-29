import { useState, useRef, useEffect } from "react";
import type { Route } from "./+types/home";
import { Topbar } from "../components/Navigation/Topbar";
import { OverlayMenu } from "../components/Navigation/OverlayMenu";
import { GatewayVeil } from "../components/Common/GatewayVeil";
import { Footline } from "../components/Common/Footline";

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

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStatementOpenRef = useRef(false);
  const isMenuOpenRef = useRef(isMenuOpen);

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

  const handlePageClick = (e: React.MouseEvent) => {
    if (isMenuOpen) return;

    // Don't trigger if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    const target = e.target as HTMLElement | null;
    // Don't intercept clicks on navigation links, topbar menu toggle, or inside overlay menu
    if (
      target?.closest("a") ||
      target?.closest(".menu-toggle") ||
      target?.closest(".overlay-menu")
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
        // Autoplay blocked; poster remains gracefully visible
      });
    }

    return () => {
      video.removeEventListener("playing", handlePlaying);
    };
  }, []);

  return (
    <div
      className="reveal-root"
      style={{ background: "#EDE7DC", minHeight: "100vh" }}
      onClick={handlePageClick}
    >
      <GatewayVeil />

      <Topbar
        variant="home"
        isOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      />

      <OverlayMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="home-hero reveal">
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
        <div className="home-hero__scrim"></div>

        <div className="home-hero__stage">
          <div
            className={`hero-statement reveal d3 ${isStatementOpen ? "is-open" : ""}`}
          >
          <h1 style={{ margin: 0 }}>
            <button
              className="step-trigger"
              type="button"
              aria-expanded={isStatementOpen}
              aria-describedby="stepReveal"
              onFocus={() => setIsStatementOpen(true)}
              onClick={() => setIsMenuOpen(true)}
            >
              Step into the <em>gateway</em> of branding — Captionz
            </button>
          </h1>
          <p className="step-reveal" id="stepReveal">
            Captionz is a strategic branding and design studio. We take businesses
            from where they stand today to the identity they're capable of — one
            deliberate threshold at a time.
          </p>
        </div>
      </div>
    </section>

      <Footline
        style={{
          maxWidth: "var(--max-w)",
          margin: "0 auto",
          padding: "22px var(--gutter)",
        }}
        links={[
          { href: "/case-study", label: "Case Study" },
          { href: "/contact", label: "Contact" },
        ]}
      />
    </div>
  );
}
