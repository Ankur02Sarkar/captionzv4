import { Link } from "react-router";

interface FootlineProps {
  links?: Array<{ href: string; label: string }>;
  style?: React.CSSProperties;
}

export function Footline({
  links = [
    { href: "/case-study", label: "Case Study" },
    { href: "/contact", label: "Contact" },
  ],
  style,
}: FootlineProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footline" style={style}>
      <span>&copy; <span>{currentYear}</span> Captionz. All rights reserved.</span>
      <div className="footline__links">
        {links.map((link) => (
          <Link key={link.href} to={link.href} viewTransition>
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
