import { Link } from "react-router";

interface MobileNavProps {
  activeSection?: "gateway" | "case-study" | "works" | "about" | "contact";
}

const ITEMS = [
  { id: "gateway", num: "01", label: "Gateway", href: "/" },
  { id: "case-study", num: "02", label: "Study", href: "/case-study" },
  { id: "works", num: "03", label: "Works", href: "/works" },
  { id: "about", num: "04", label: "About", href: "/about" },
  { id: "contact", num: "05", label: "Contact", href: "/contact" },
] as const;

/** The rail, folded down to the thumb line on narrow screens. */
export function MobileNav({ activeSection = "case-study" }: MobileNavProps) {
  return (
    <nav className="mobile-nav" aria-label="Sections">
      {ITEMS.map((item) => {
        const isActive = item.id === activeSection;
        return (
          <Link
            key={item.id}
            to={item.href}
            className={`mobile-nav__item ${isActive ? "is-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            data-no-gate
          >
            <span className="mobile-nav__num">{item.num}</span>
            <span className="mobile-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
