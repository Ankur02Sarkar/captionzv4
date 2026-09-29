import { Link } from "react-router";
import type { Route } from "./+types/case-study-detail";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { Footline } from "../components/Common/Footline";
import { getDatabase } from "../db/getDb";
import { caseStudies } from "../db/schema";
import { eq, ne } from "drizzle-orm";

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
  galleryImages: string[];
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

function isPdfUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.pathname.toLowerCase().endsWith(".pdf");
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
      const rows = await db
        .select()
        .from(caseStudies)
        .where(eq(caseStudies.slug, slug))
        .limit(1);

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
          galleryImages: safeParseJson<string[]>(r.galleryImages, []),
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

        // Find next case study for navigation
        const nextRows = await db
          .select({ slug: caseStudies.slug, client: caseStudies.client, title: caseStudies.title })
          .from(caseStudies)
          .where(ne(caseStudies.slug, slug))
          .limit(1);

        if (nextRows.length > 0) {
          nextStudy = nextRows[0];
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
    {
      name: "description",
      content: study.tagline || study.overview,
    },
  ];
}

export default function CaseStudyDetailPage({ loaderData }: Route.ComponentProps) {
  const { study, nextStudy } = loaderData;
  const isPdf = isPdfUrl(study.externalUrl);

  return (
    <ShellLayout railMode="work" activeSection="case-study">
      <main className="main">
        {/* Back Link */}
        <Link
          className="link-arrow"
          to="/case-study"
          style={{ marginTop: "clamp(96px, 12vw, 148px)", border: "none" }}
          viewTransition
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Case Studies
        </Link>

        {/* Hero Section */}
        <div className="cs-detail-hero reveal">
          <div className="cs-detail-header-top">
            {study.clientLogo && (
              <div className="cs-detail-brand-badge" title={`${study.client} Logo`}>
                <img
                  src={study.clientLogo}
                  alt={`${study.client} logo`}
                  className="cs-detail-brand-logo"
                />
              </div>
            )}
            <div className="cs-detail-meta">
              <div className="cs-detail-meta__item">
                <span className="cs-detail-meta__label">Client</span>
                <span className="cs-detail-meta__val">{study.client}</span>
              </div>
              <div className="cs-detail-meta__item">
                <span className="cs-detail-meta__label">Discipline</span>
                <span className="cs-detail-meta__val">{study.category}</span>
              </div>
              <div className="cs-detail-meta__item">
                <span className="cs-detail-meta__label">Sector</span>
                <span className="cs-detail-meta__val">{study.industry}</span>
              </div>
              <div className="cs-detail-meta__item">
                <span className="cs-detail-meta__label">Year</span>
                <span className="cs-detail-meta__val">{study.year}</span>
              </div>
            </div>
          </div>

          <h1 className="cs-detail-title">{study.title}</h1>
          <p className="cs-detail-tagline">{study.tagline}</p>
        </div>

        {isPdf ? (
          /* PDF Document Viewer Container */
          <div className="cs-pdf-wrapper reveal d1">
            <div className="cs-pdf-header">
              <div className="cs-pdf-header__meta">
                <span className="cs-pdf-header__tag">Interactive PDF Presentation</span>
                <span className="cs-pdf-header__name">{study.client} Dossier</span>
              </div>
              <a
                href={study.externalUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-pdf-open-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>Open in New Tab</span>
              </a>
            </div>

            <div className="cs-pdf-frame-box">
              <iframe
                src={study.externalUrl!}
                title={`${study.client} — ${study.title}`}
                className="cs-pdf-frame"
              />
            </div>
          </div>
        ) : (
          <>
            {/* Hero Banner Visual */}
            <div className="cd-visual cd-visual--cover reveal d1">
              <img
                src={study.heroImage}
                alt={`${study.client} — ${study.title}`}
                loading="eager"
              />
            </div>

            {/* High-Tension Editorial Narrative */}
            <div className="cs-narrative-grid reveal d1">
              <div className="cs-narrative-card cs-narrative-card--full">
                <p className="cs-narrative-card__eyebrow">The Overview</p>
                <p className="cs-narrative-card__body">{study.overview}</p>
              </div>
              <div className="cs-narrative-card">
                <p className="cs-narrative-card__eyebrow">The Friction &amp; Challenge</p>
                <p className="cs-narrative-card__body">{study.challenge}</p>
              </div>
              <div className="cs-narrative-card">
                <p className="cs-narrative-card__eyebrow">The Strategy &amp; Execution</p>
                <p className="cs-narrative-card__body">{study.strategy}</p>
              </div>
            </div>

            {/* Results Metrics */}
            {study.results && study.results.length > 0 && (
              <div className="reveal d2">
                <p className="eyebrow" style={{ marginTop: "32px", marginBottom: "8px" }}>
                  Quantified Impact
                </p>
                <div className="cs-results-grid">
                  {study.results.map((res, i) => (
                    <div key={i} className="cs-result-card">
                      <span className="cs-result-card__val">{res.value}</span>
                      <span className="cs-result-card__label">{res.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonial Quote */}
            {study.testimonial && (
              <div className="cd-quote reveal">
                <span className="cd-quote__mark">“</span>
                <p className="cd-quote__text">{study.testimonial.quote}</p>
                <span className="cd-quote__attr">
                  {study.testimonial.author} — {study.testimonial.title}
                </span>
              </div>
            )}

            {/* Deliverables Panel */}
            {study.deliverables && study.deliverables.length > 0 && (
              <div className="cs-deliverables-panel reveal">
                <p className="cs-detail-meta__label">Deliverables &amp; Systems Engineered</p>
                <div className="cs-deliverables-list">
                  {study.deliverables.map((item, idx) => (
                    <span key={idx} className="cs-deliverable-item">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Grid */}
            {study.galleryImages && study.galleryImages.length > 0 && (
              <div className="reveal">
                <p className="eyebrow" style={{ marginTop: "32px", marginBottom: "8px" }}>
                  Project Visual Architecture
                </p>
                <div className="cs-gallery-grid">
                  {study.galleryImages.map((imgUrl, i) => (
                    <div key={i} className="cs-gallery-item">
                      <img
                        src={imgUrl}
                        alt={`${study.client} showcase frame ${i + 1}`}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Next Case Study Link */}
        {nextStudy && (
          <div className="cd-next reveal">
            <div>
              <span className="cd-next__label">Next Case Study</span>
              <p className="cd-next__name">{nextStudy.client}</p>
            </div>
            <Link
              className="link-arrow"
              to={`/case-study/${nextStudy.slug}`}
              viewTransition
            >
              Explore {nextStudy.client}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 17L17 7M17 7H8M17 7V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        )}

        <Footline
          links={[
            { href: "/case-study", label: "All Case Studies" },
            { href: "/works", label: "Works Archive" },
            { href: "/contact", label: "Contact" },
          ]}
        />
      </main>
    </ShellLayout>
  );
}
