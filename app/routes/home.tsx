import { useState, useRef, useEffect } from "react";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Topbar } from "../components/Navigation/Topbar";
import { OverlayMenu } from "../components/Navigation/OverlayMenu";
import { Footline } from "../components/Common/Footline";
import { Reveal } from "../components/Motion/Reveal";

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

const GATEWAYS = [
  {
    num: "02",
    name: "Case Studies",
    label: "Nine brands, the friction they faced and the systems that moved them.",
    href: "/case-study",
  },
  {
    num: "03",
    name: "Works Archive",
    label: "Identity, print, packaging and environmental design across a decade.",
    href: "/works",
  },
  {
    num: "04",
    name: "The Studio",
    label: "Who we are, how we think, and the disciplines we build with.",
    href: "/about",
  },
  {
    num: "05",
    name: "Start a Project",
    label: "Tell us where the brand stands. We'll show you the next threshold.",
    href: "/contact",
  },
];

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
    // Links, the menu toggle, the overlay and the page body below the fold
    // all keep their own behaviour.
    if (
      target?.closest("a") ||
      target?.closest("button") ||
      target?.closest(".menu-toggle") ||
      target?.closest(".overlay-menu") ||
      target?.closest(".global-back-btn") ||
      target?.closest(".home-strip")
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
    <div className="reveal-root" onClick={handlePageClick}>
      <Topbar
        variant="home"
        isOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      />

      <OverlayMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

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
              Captionz is a strategic branding and design studio. We take businesses from where they
              stand today to the identity they're capable of — one deliberate threshold at a time.
            </p>
          </div>
        </div>

        <div className="home-scrollcue" aria-hidden="true">
          <span>Scroll</span>
          <i />
        </div>
      </section>

      <section className="home-strip">
        <Reveal className="home-strip__head">
          <p className="eyebrow" style={{ marginBottom: 0 }}>
            The Gateways
          </p>
          <p className="home-strip__note">
            Everything the studio makes is reached through the same door. Pick where you'd like to
            step in.
          </p>
        </Reveal>

        <Reveal className="home-strip__grid" variant="fade">
          {GATEWAYS.map((item) => (
            <Link key={item.href} to={item.href} className="home-strip__item">
              <span className="home-strip__num">{item.num}</span>
              <span className="home-strip__name">{item.name}</span>
              <span className="home-strip__label">{item.label}</span>
              <span className="home-strip__arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 17L17 7M17 7H8M17 7V16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </Reveal>
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
