interface BrandPlateProps {
  client: string;
  category?: string;
  industry?: string;
  year?: number;
  /** Position in the archive, rendered as the plate index. */
  index?: number;
  /** `card` for index tiles, `hero` for detail banners. */
  size?: "card" | "hero";
  className?: string;
}

/**
 * The fallback visual for work with no photography of its own. Instead of a
 * grey placeholder it composes a typographic plate out of the brand system:
 * condensed name, red rule, discipline and year, over a hairline gate.
 */
export function BrandPlate({
  client,
  category,
  industry,
  year,
  index,
  size = "card",
  className = "",
}: BrandPlateProps) {
  const meta = [industry, year].filter(Boolean).join(" · ");

  return (
    <div
      className={`brand-plate brand-plate--${size} ${className}`.trim()}
      role="img"
      aria-label={`${client}${category ? ` — ${category}` : ""}`}
    >
      <span className="brand-plate__grid" aria-hidden="true" />
      <img className="brand-plate__gate" src="/assets/gateway-icon.png" alt="" aria-hidden="true" />
      <div className="brand-plate__body">
        {index !== undefined && (
          <span className="brand-plate__index">{String(index).padStart(2, "0")}</span>
        )}
        <span className="brand-plate__name">{client}</span>
        <span className="brand-plate__rule" aria-hidden="true" />
        {category && <span className="brand-plate__category">{category}</span>}
        {meta && <span className="brand-plate__meta">{meta}</span>}
      </div>
    </div>
  );
}

interface BrandMonogramProps {
  client: string;
  className?: string;
}

/** Initials-in-a-frame stand-in for clients with no logo file. */
export function BrandMonogram({ client, className = "" }: BrandMonogramProps) {
  const initials = client
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <span className={`brand-monogram ${className}`.trim()} aria-hidden="true">
      {initials || "C"}
    </span>
  );
}
