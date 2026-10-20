import { Link } from "react-router";

interface TopbarProps {
  variant?: "home" | "default";
  onToggleMenu: () => void;
  isOpen?: boolean;
}

export function Topbar({ variant = "default", onToggleMenu, isOpen = false }: TopbarProps) {
  const isHome = variant === "home";

  return (
    <header className="topbar">
      {isHome ? (
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
        className={`menu-toggle ${isHome ? "is-light is-attention" : "is-dark"} ${
          isOpen ? "is-open" : ""
        }`}
        onClick={onToggleMenu}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-haspopup="true"
        aria-expanded={isOpen}
        data-cursor="open"
        data-cursor-label={isOpen ? "Close" : "Menu"}
        type="button"
      >
        <span className="menu-toggle__label" aria-hidden="true">
          <span className="menu-toggle__label-open">Menu</span>
          <span className="menu-toggle__label-close">Close</span>
        </span>
        <span className="menu-toggle__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
    </header>
  );
}
