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
        <Link to="/" className="home-logo-block reveal d1" aria-label="Captionz home" viewTransition>
          <span className="home-word">
            C<img src="/assets/gateway-icon.png" alt="" />PTIONZ
          </span>
          <span className="home-tag">Gateway of Branding</span>
        </Link>
      ) : (
        <Link
          to="/"
          className="topbar__mark is-dark"
          aria-label="Captionz home"
          viewTransition
        >
          <img src="/assets/gateway-icon.png" alt="Captionz" style={{ width: "100%" }} />
        </Link>
      )}

      <button
        className={`menu-toggle is-dark`}
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
