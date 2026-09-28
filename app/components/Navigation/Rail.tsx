import { Link } from "react-router";

interface RailProps {
  mode?: "standard" | "work";
  activeSection?: "gateway" | "case-study" | "works" | "about" | "contact";
}

export function Rail({ mode = "standard", activeSection = "case-study" }: RailProps) {
  const standardItems = [
    { id: "gateway", num: "01", label: "Gateway", href: "/" },
    { id: "case-study", num: "02", label: "Case Study", href: "/case-study" },
    { id: "works", num: "03", label: "Works", href: "/works" },
    { id: "about", num: "04", label: "About Us", href: "/about" },
    { id: "contact", num: "05", label: "Contact", href: "/contact" },
  ];

  const workItems = [
    { id: "case-study", num: "01", label: "Case Study", href: "/case-study" },
    { id: "works", num: "02", label: "Works", href: "/works" },
    { id: "about", num: "03", label: "About Us", href: "/about" },
    { id: "contact", num: "04", label: "Contact", href: "/contact" },
  ];

  const items = mode === "work" ? workItems : standardItems;

  return (
    <aside className="rail">
      <Link to="/" className="rail__mark" aria-label="Captionz home" viewTransition>
        <img src="/assets/gateway-icon.png" alt="" />
      </Link>
      <div className="rail__nav">
        {items.map((item) => {
          const isActive = item.id === activeSection;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`rail__item ${isActive ? "is-active" : ""}`}
              viewTransition
            >
              <span className="rail__num">{item.num}</span>
              <span className="rail__label">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <Link to="/contact" className="rail__foot" viewTransition>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 19L19 5M19 5H8M19 5V16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Let's build what matters
      </Link>
    </aside>
  );
}
