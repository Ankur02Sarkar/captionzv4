import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";

interface OverlayMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OverlayMenu({ isOpen, onClose }: OverlayMenuProps) {
  const location = useLocation();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("menu-open");
      if (firstLinkRef.current) {
        firstLinkRef.current.focus({ preventScroll: true });
      }
    } else {
      document.body.classList.remove("menu-open");
    }

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const path = location.pathname;

  const isCurrent = (route: string) => {
    if (route === "/") {
      return path === "/" || path === "/index.html";
    }
    return path.startsWith(route);
  };

  const navItems = [
    { num: "01", label: "Gateway", href: "/" },
    { num: "02", label: "Case Study", href: "/case-study" },
    { num: "03", label: "Works", href: "/works" },
    { num: "04", label: "About Us", href: "/about" },
    { num: "05", label: "Contact", href: "/contact" },
  ];

  return (
    <nav className="overlay-menu" aria-label="Primary" aria-hidden={!isOpen}>
      <img className="overlay-menu__gateway" src="/assets/gateway-icon.png" alt="" />
      <button
        className="menu-toggle overlay-menu__close"
        onClick={onClose}
        aria-label="Close menu"
        type="button"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className="overlay-menu__nav">
        {navItems.map((item, index) => {
          const active = isCurrent(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              ref={index === 0 ? firstLinkRef : undefined}
              className={`overlay-menu__row ${active ? "is-current" : ""}`}
              onClick={onClose}
              viewTransition
              aria-current={active ? "page" : undefined}
            >
              <span className="overlay-menu__num">{item.num}</span>
              <span className="overlay-menu__link">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="overlay-menu__foot">
        <a href="mailto:capt@captionz.biz">capt@captionz.biz</a>
        <a href="tel:+919849818165">+91 98498 18165</a>
      </div>
    </nav>
  );
}
