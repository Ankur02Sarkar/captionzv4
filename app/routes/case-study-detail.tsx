import { Link } from "react-router";
import type { Route } from "./+types/case-study-detail";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { Footline } from "../components/Common/Footline";
import { BrandPlate, BrandMonogram } from "../components/Common/BrandPlate";
import { Reveal } from "../components/Motion/Reveal";
import { CaseStudyFlipbook } from "../components/CaseStudy/CaseStudyFlipbook";
import { getDatabase } from "../db/getDb";
import { caseStudies } from "../db/schema";
import { eq, desc, asc } from "drizzle-orm";

interface DetailStudy {
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
  overview: string;
  externalUrl?: string | null;
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

  let study: DetailStudy | null = null;
  let nextStudy: { slug: string; client: string; title: string } | null = null;

  if (db) {
    try {
      const rows = await db
        .select({
          id: caseStudies.id,
          slug: caseStudies.slug,
          client: caseStudies.client,
          title: caseStudies.title,
          industry: caseStudies.industry,
          category: caseStudies.category,
          year: caseStudies.year,
          tagline: caseStudies.tagline,
          heroImage: caseStudies.heroImage,
          clientLogo: caseStudies.clientLogo,
          overview: caseStudies.overview,
          externalUrl: caseStudies.externalUrl,
        })
        .from(caseStudies)
        .where(eq(caseStudies.slug, slug))
        .limit(1);

      if (rows.length > 0) {
        study = rows[0];

        // A deterministic walk through the archive: the same order as the
        // index, wrapping back to the first study at the end.
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
    } catch (error) {
      console.error("D1 query error in case-study-detail loader:", error);
    }
  }

  if (!study) {
    throw new Response("Case Study Not Found", { status: 404 });
  }

  return { study, nextStudy };
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

export default function CaseStudyDetailPage({ loaderData }: Route.ComponentProps) {
  const { study, nextStudy } = loaderData;
  const hasDeck = isPdfUrl(study.externalUrl);
  const deckSrc = hasDeck ? `/case-study/${study.slug}/deck.pdf` : null;
  const meta = [
    { label: "Sector", value: study.industry },
    { label: "Discipline", value: study.category },
    { label: "Year", value: String(study.year) },
  ];

  return (
    <ShellLayout railMode="work" activeSection="case-study">
      <main className="main cs-page">
        <Link className="cs-page__back" to="/case-study">
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

        <header className="cs-page__hero">
          <div className="cs-page__copy">
            <p className="cs-page__eyebrow">
              <span className="cs-page__eyebrow-line" aria-hidden="true" />
              Case Study <span aria-hidden="true">/</span> {study.year}
            </p>

            <div className="cs-page__clientline">
              <span className="cs-page__badge">
                {study.clientLogo ? (
                  <img src={study.clientLogo} alt={`${study.client} logo`} />
                ) : (
                  <BrandMonogram client={study.client} />
                )}
              </span>
              <span className="cs-page__client">{study.client}</span>
            </div>

            <Reveal variant="mask">
              <h1 className="cs-page__title">{study.title}</h1>
            </Reveal>

            {study.tagline && <p className="cs-page__tagline">{study.tagline}</p>}

            <p className="cs-page__description">{study.overview}</p>

            <div className="cs-page__meta">
              {meta.map((item) => (
                <span className="cs-page__meta-item" key={item.label}>
                  <span className="cs-page__meta-label">{item.label}</span>
                  <span className="cs-page__meta-value">{item.value}</span>
                </span>
              ))}
            </div>

            <div className="cs-page__actions">
              {deckSrc && (
                <a className="cs-page__action cs-page__action--primary" href="#deck">
                  Flip the deck
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 4v16m0 0 6-6m-6 6-6-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}

              {study.externalUrl && (
                <a
                  className="cs-page__action cs-page__action--quiet"
                  href={study.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-no-gate
                >
                  Open full PDF
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <Reveal variant="gate" className="cs-page__visual">
            <div className="cs-page__media">
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
              <span className="cs-page__visual-label">
                <span>Selected work</span>
                <span>{study.category}</span>
              </span>
              <span className="cs-page__corner" aria-hidden="true" />
            </div>
          </Reveal>
        </header>

        {deckSrc ? (
          <section
            className="cs-page__deck"
            id="deck"
            aria-labelledby="case-study-deck-title"
          >
            <div className="cs-page__deck-head">
              <div className="cs-page__deck-intro">
                <p className="cs-page__kicker">
                  <span className="cs-page__kicker-dot" aria-hidden="true" />
                  The Full Deck
                </p>
                <h2 id="case-study-deck-title" className="cs-page__deck-title">
                  Turn the <em>pages.</em>
                </h2>
                <p className="cs-page__deck-copy">
                  The complete case study, one full page at a time. Drag a corner,
                  swipe, or use the keyboard to move through it.
                </p>
              </div>

              <div className="cs-page__deck-side">
                <span className="cs-page__deck-meta">
                  {study.year} <span aria-hidden="true">/</span> {study.category}
                </span>
                {study.externalUrl && (
                  <a
                    className="cs-page__pdf-link"
                    href={study.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-no-gate
                  >
                    Open full PDF
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M7 17 17 7M17 7H8M17 7v9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            <CaseStudyFlipbook
              src={deckSrc}
              client={study.client}
              title={study.title}
              openHref={study.externalUrl}
            />
          </section>
        ) : (
          <section className="cs-page__deck cs-page__deck--empty" id="deck">
            <p className="cs-page__kicker">
              <span className="cs-page__kicker-dot" aria-hidden="true" />
              The Full Deck
            </p>
            <h2 className="cs-page__deck-title">
              A deck is <em>being prepared.</em>
            </h2>
            <p className="cs-page__deck-copy">
              The full case study PDF for this project is not attached yet. In the
              meantime, the work above is the short version.
            </p>
          </section>
        )}

        <section className="cs-page__next" aria-label="Continue exploring">
          <div>
            <p className="cs-page__next-kicker">The archive continues</p>
            {nextStudy ? (
              <Link className="cs-page__next-link" to={`/case-study/${nextStudy.slug}`}>
                <span className="cs-page__next-client">{nextStudy.client}</span>
                <span className="cs-page__next-title">{nextStudy.title}</span>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M7 17 17 7M17 7H8M17 7v9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ) : (
              <Link className="cs-page__next-link" to="/case-study">
                <span className="cs-page__next-client">All Case Studies</span>
                <span className="cs-page__next-title">Return to the archive</span>
              </Link>
            )}
          </div>

          <Link className="btn" to="/contact">
            Start a Project
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 17 17 7M17 7H8M17 7v9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </section>

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
