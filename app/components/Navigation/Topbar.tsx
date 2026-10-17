import { Link } from "react-router";

interface TopbarProps {
  variant?: "home" | "default";
  onToggleMenu: () => void;
  isOpen?: boolean;
}

export function Topbar({ variant = "default", onToggleMenu, isOpen = false }: TopbarProps) {
  return (
    <header className="topbar">
      {variant === "home" ? (
        <Link to="/" className="home-logo-block" aria-label="Captionz home" data-no-gate>
          <span className="home-word">
            C<img src="/assets/gateway-icon.png" alt="" />
            PTIONZ
          </span>
          <span className="home-tag">Gateway of Branding</span>
        </Link>
      ) : (
        <Link to="/" className="topbar__mark" aria-label="Captionz home">
          <img src="/assets/gateway-icon.png" alt="" />
        </Link>
      )}

      <button
        className={`menu-toggle ${variant === "home" ? "is-light" : "is-dark"}`}
        onClick={onToggleMenu}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-haspopup="true"
        aria-expanded={isOpen}
        type="button"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
}
