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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
    <div className="reveal-root" style={{ background: "#EDE7DC", minHeight: "100vh" }}>
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
          poster="/assets/home-poster.jpg"
          aria-hidden="true"
          className={isPlaying ? "is-playing" : ""}
        >
          <source src="/assets/home-animation.mp4" type="video/mp4" />
        </video>
        <div className="home-hero__scrim"></div>

        <div
          className={`hero-statement reveal d3 ${isStatementOpen ? "is-open" : ""}`}
          style={{
            position: "absolute",
            left: "50%",
            bottom: "6%",
            transform: "translateX(-50%)",
            zIndex: 4,
          }}
        >
          <h1 style={{ margin: 0 }}>
            <button
              className="step-trigger"
              type="button"
              aria-expanded={isStatementOpen}
              aria-describedby="stepReveal"
              onClick={() => setIsStatementOpen((prev) => !prev)}
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
