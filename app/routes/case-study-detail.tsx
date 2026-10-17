import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/case-study-detail";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { Footline } from "../components/Common/Footline";
import { BrandPlate, BrandMonogram } from "../components/Common/BrandPlate";
import { Reveal } from "../components/Motion/Reveal";
import { CountUp } from "../components/Motion/CountUp";
import { getDatabase } from "../db/getDb";
import { caseStudies } from "../db/schema";
import { eq, desc, asc } from "drizzle-orm";

interface GalleryImage {
  src: string;
  caption?: string;
}

interface ParsedCaseStudy {
  id: string;
  slug: string;
  client: string;
  title: string;
  industry: string;
  category: string;
  year: number;
  tagline: string;
  heroImage: string;
  clientLogo?: string | null;
  galleryImages: GalleryImage[];
  overview: string;
  challenge: string;
  strategy: string;
  results: Array<{ label: string; value: string }>;
  testimonial: { quote: string; title: string; author: string } | null;
  deliverables: string[];
  externalUrl?: string | null;
  published: boolean;
}

function safeParseJson<T>(raw: any, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === "object") return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Galleries are stored as `{ src, caption }` or bare URL strings. */
function normaliseGallery(raw: any): GalleryImage[] {
  const parsed = safeParseJson<unknown>(raw, []);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((entry): GalleryImage | null => {
      if (typeof entry === "string") return { src: entry };
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        const src = (record.src || record.url || record.image) as string | undefined;
        if (!src) return null;
        return { src, caption: (record.caption as string) || undefined };
      }
      return null;
    })
    .filter((entry): entry is GalleryImage => Boolean(entry?.src));
}

function isPdfUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    return new URL(url).pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return url.toLowerCase().includes(".pdf");
  }
}

export async function loader({ params, context }: Route.LoaderArgs) {
  let slug = params.slug;
  if (!slug) {
    throw new Response("Case Study Not Found", { status: 404 });
  }
  if (slug.endsWith(".html")) {
    slug = slug.replace(/\.html$/, "");
  }

  const db = getDatabase(context);

  let item: ParsedCaseStudy | null = null;
  let nextStudy: { slug: string; client: string; title: string } | null = null;

  if (db) {
    try {
      const rows = await db.select().from(caseStudies).where(eq(caseStudies.slug, slug)).limit(1);

      if (rows.length > 0) {
        const r = rows[0];
        item = {
          id: r.id,
          slug: r.slug,
          client: r.client,
          title: r.title,
          industry: r.industry,
          category: r.category,
          year: r.year,
          tagline: r.tagline,
          heroImage: r.heroImage,
          clientLogo: r.clientLogo,
          galleryImages: normaliseGallery(r.galleryImages),
          overview: r.overview,
          challenge: r.challenge,
          strategy: r.strategy,
          results: safeParseJson<Array<{ label: string; value: string }>>(r.results, []),
          testimonial: safeParseJson<{ quote: string; title: string; author: string } | null>(
            r.testimonial,
            null
          ),
          deliverables: safeParseJson<string[]>(r.deliverables, []),
          externalUrl: r.externalUrl,
          published: r.published,
        };

        // A deterministic walk through the archive: the same order as the index,
        // wrapping back to the first study at the end.
        const ordered = await db
          .select({ slug: caseStudies.slug, client: caseStudies.client, title: caseStudies.title })
          .from(caseStudies)
          .orderBy(desc(caseStudies.year), asc(caseStudies.client));

        const currentIndex = ordered.findIndex((entry) => entry.slug === slug);
        if (ordered.length > 1 && currentIndex >= 0) {
          const next = ordered[(currentIndex + 1) % ordered.length];
          nextStudy = { slug: next.slug, client: next.client, title: next.title };
        }
      }
    } catch (err) {
      console.error("D1 query error in case-study-detail loader:", err);
    }
  }

  if (!item) {
    throw new Response("Case Study Not Found", { status: 404 });
  }

  return { study: item, nextStudy };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.study) {
    return [{ title: "Case Study Not Found — Captionz" }];
  }
  const { study } = loaderData;
  return [
    { title: `${study.client} — ${study.title} — Captionz` },
    { name: "description", content: study.tagline || study.overview },
  ];
}

function Lightbox({
  images,
  index,
  onClose,
  onStep,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onStep(1);
      if (event.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onStep]);

  const current = images[index];
  if (!current) return null;

  return (
    <div
      className="cs-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={current.caption || "Project image"}
      onClick={onClose}
    >
      <div className="cs-lightbox__bar" onClick={(event) => event.stopPropagation()}>
        <span className="cs-lightbox__count">
          {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
        <div className="cs-lightbox__controls">
          <button
            type="button"
            className="cs-lightbox__nav"
            onClick={() => onStep(-1)}
            aria-label="Previous image"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="cs-lightbox__nav"
            onClick={() => onStep(1)}
            aria-label="Next image"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="cs-lightbox__close" onClick={onClose}>
            Close
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="cs-lightbox__stage" onClick={(event) => event.stopPropagation()}>
        <img className="cs-lightbox__img" src={current.src} alt={current.caption || ""} />
      </div>

      {current.caption && (
        <p className="cs-lightbox__caption" onClick={(event) => event.stopPropagation()}>
          {current.caption}
        </p>
      )}
    </div>
  );
}

export default function CaseStudyDetailPage({ loaderData }: Route.ComponentProps) {
  const { study, nextStudy } = loaderData;
  const isPdf = isPdfUrl(study.externalUrl);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isDeckOpen, setIsDeckOpen] = useState(false);

  const gallery = study.galleryImages;
  const hasGallery = gallery.length > 0;

  const step = useCallback(
    (delta: number) => {
      setLightboxIndex((current) => {
        if (current === null) return current;
        return (current + delta + gallery.length) % gallery.length;
      });
    },
    [gallery.length]
  );

  const chips = useMemo(
    () => [study.category, study.industry].filter(Boolean),
    [study.category, study.industry]
  );

  return (
    <ShellLayout railMode="work" activeSection="case-study">
      <main className="main cs-detail">
        <Link className="cs-back" to="/case-study">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All Case Studies
        </Link>

        {/* ---- Hero ---- */}
        <header className="cs-hero">
          <div>
            <div className="cs-hero__id">
              <span className="cs-hero__badge">
                {study.clientLogo ? (
                  <img src={study.clientLogo} alt={`${study.client} logo`} />
                ) : (
                  <BrandMonogram client={study.client} />
                )}
              </span>
              <span>
                <span className="cs-hero__label">
                  Case Study {String(study.year)}
                </span>
                <span className="cs-hero__client">{study.client}</span>
              </span>
            </div>

            <Reveal variant="mask">
              <h1 className="cs-hero__title">{study.title}</h1>
            </Reveal>

            {study.tagline && <p className="cs-hero__tagline">{study.tagline}</p>}

            {chips.length > 0 && (
              <div className="cs-chip-row">
                {chips.map((chip) => (
                  <span key={chip} className="chip">
                    {chip}
                  </span>
                ))}
              </div>
            )}

            <div className="cs-hero__meta">
              <span className="cs-meta">
                <span className="cs-meta__label">Sector</span>
                <span className="cs-meta__val">{study.industry}</span>
              </span>
              <span className="cs-meta">
                <span className="cs-meta__label">Discipline</span>
                <span className="cs-meta__val">{study.category}</span>
              </span>
              <span className="cs-meta">
                <span className="cs-meta__label">Year</span>
                <span className="cs-meta__val">{study.year}</span>
              </span>
              {study.deliverables.length > 0 && (
                <span className="cs-meta">
                  <span className="cs-meta__label">Workstreams</span>
                  <span className="cs-meta__val">{study.deliverables.length}</span>
                </span>
              )}
            </div>
          </div>

          <Reveal variant="gate" className="cs-hero__visual">
            {study.heroImage ? (
              <img src={study.heroImage} alt={`${study.client} — ${study.title}`} />
            ) : (
              <BrandPlate
                client={study.client}
                category={study.category}
                industry={study.industry}
                year={study.year}
                size="hero"
              />
            )}
          </Reveal>
        </header>

        {/* ---- The story ---- */}
        <section className="cs-section">
          <div className="cs-section__head">
            <span className="cs-section__label">The Story</span>
            <span className="cs-section__note">
              What the brand was up against, and the decision that changed its direction.
            </span>
          </div>

          <div className="cs-narrative">
            <Reveal variant="fade" className="cs-narrative__card">
              <span className="cs-narrative__eyebrow">The Brief</span>
              <p className="cs-narrative__body cs-narrative__body--lead">{study.overview}</p>
            </Reveal>
            <Reveal variant="fade" delay={0.08} className="cs-narrative__card">
              <span className="cs-narrative__eyebrow">The Friction</span>
              <p className="cs-narrative__body">{study.challenge}</p>
            </Reveal>
            <Reveal variant="fade" delay={0.16} className="cs-narrative__card">
              <span className="cs-narrative__eyebrow">The Move</span>
              <p className="cs-narrative__body">{study.strategy}</p>
            </Reveal>
          </div>
        </section>

        {/* ---- The work ---- */}
        {hasGallery && (
          <section className="cs-section">
            <div className="cs-section__head">
              <span className="cs-section__label">The Work</span>
              <span className="cs-section__note">
                {gallery.length} pieces from the system. Select any frame to open it full size.
              </span>
            </div>

            <div className="cs-work__strip">
              {gallery.map((image, index) => (
                <Reveal key={image.src} variant="up" delay={Math.min(index, 5) * 0.04}>
                  <button
                    type="button"
                    className="cs-work__item"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Open image ${index + 1}${image.caption ? `: ${image.caption}` : ""}`}
                  >
                    <span className="cs-work__frame">
                      <img src={image.src} alt={image.caption || ""} loading="lazy" />
                      <span className="cs-work__zoom" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                    <span className="cs-work__caption">
                      <span className="cs-work__num">{String(index + 1).padStart(2, "0")}</span>
                      <span className="cs-work__text">
                        {image.caption || `${study.client} — frame ${index + 1}`}
                      </span>
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ---- The outcome ---- */}
        {study.results.length > 0 && (
          <section className="cs-section">
            <div className="cs-section__head">
              <span className="cs-section__label">The Outcome</span>
              <span className="cs-section__note">What the brand walked away with.</span>
            </div>

            <div className="cs-results">
              {study.results.map((result, index) => (
                <Reveal key={index} variant="fade" delay={index * 0.07} className="cs-result">
                  <span className="cs-result__val">
                    <CountUp value={result.value} />
                  </span>
                  <span className="cs-result__label">{result.label}</span>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ---- Client voice ---- */}
        {study.testimonial && (
          <Reveal variant="fade" className="cs-quote">
            <span className="cs-quote__mark" aria-hidden="true">
              “
            </span>
            <p className="cs-quote__text">{study.testimonial.quote}</p>
            <span className="cs-quote__attr">
              {study.testimonial.author}
              {study.testimonial.title ? ` — ${study.testimonial.title}` : ""}
            </span>
          </Reveal>
        )}

        {/* ---- What we built ---- */}
        {study.deliverables.length > 0 && (
          <section className="cs-section">
            <div className="cs-section__head">
              <span className="cs-section__label">What We Built</span>
            </div>
            <div className="cs-deliverables">
              {study.deliverables.map((item, index) => (
                <span key={item} className="cs-deliverable">
                  <span className="cs-deliverable__num">{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ---- The deck ---- */}
        {isPdf && (
          <section className="cs-dossier">
            <div className="cs-dossier__head">
              <div className="cs-dossier__info">
                <span className="cs-dossier__tag">The Full Deck</span>
                <span className="cs-dossier__name">{study.client} — Case Study</span>
                <span className="cs-dossier__facts">
                  Read the unabridged presentation, exactly as it was shared with the client.
                </span>
              </div>
              <div className="cs-dossier__actions">
                {!isDeckOpen && (
                  <button
                    type="button"
                    className="cs-dossier__btn cs-dossier__btn--primary"
                    onClick={() => setIsDeckOpen(true)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Read the Deck
                  </button>
                )}
                <a
                  href={study.externalUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cs-dossier__btn"
                  data-no-gate
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open in New Tab
                </a>
              </div>
            </div>

            <div className="cs-dossier__stage">
              {isDeckOpen ? (
                <iframe
                  src={study.externalUrl!}
                  title={`${study.client} — ${study.title}`}
                  className="cs-dossier__frame"
                />
              ) : (
                <div className="cs-dossier__poster">
                  <span className="cs-dossier__poster-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="cs-dossier__poster-title">
                    {study.client} — The Complete Presentation
                  </span>
                  <p className="cs-dossier__poster-note">
                    The deck runs to several megabytes. Open it here when you're ready, or take it
                    with you.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---- Closing ---- */}
        <section className="cs-outcome">
          <div>
            <p className="cs-outcome__lead">Your Gateway Is Next</p>
            <p className="cs-outcome__statement">
              Every brand crosses the same threshold: from what it <em>sells</em> to what it{" "}
              <em>means</em>.
            </p>
          </div>

          <div className="cs-outcome__side">
            <p className="cs-outcome__body">
              Tell us where the brand stands today. We'll show you the door it should be walking
              through.
            </p>
            <Link className="btn" to="/contact">
              Start a Project
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7 17L17 7M17 7H8M17 7V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {nextStudy && (
              <Link className="cs-outcome__next" to={`/case-study/${nextStudy.slug}`}>
                <span>
                  <span className="cs-outcome__next-label">Next Case Study</span>
                  <span className="cs-outcome__next-name">{nextStudy.client}</span>
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M7 17L17 7M17 7H8M17 7V16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}
          </div>
        </section>

        <Footline
          links={[
            { href: "/case-study", label: "All Case Studies" },
            { href: "/works", label: "Works Archive" },
            { href: "/contact", label: "Contact" },
          ]}
        />
      </main>

      {lightboxIndex !== null && (
        <Lightbox
          images={gallery}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onStep={step}
        />
      )}
    </ShellLayout>
  );
}
