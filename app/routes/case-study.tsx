import { Link, useSearchParams, Form } from "react-router";
import type { Route } from "./+types/case-study";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { Footline } from "../components/Common/Footline";
import { BrandPlate, BrandMonogram } from "../components/Common/BrandPlate";
import { Reveal } from "../components/Motion/Reveal";
import { getDatabase } from "../db/getDb";
import { caseStudies } from "../db/schema";
import { eq, or, like, and, count, desc } from "drizzle-orm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Case Studies — Captionz" },
    {
      name: "description",
      content:
        "In-depth stories of brands Captionz has partnered with to solve challenges, build meaning and create lasting impact.",
    },
  ];
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
  galleryImages: Array<string | { src: string; caption?: string }>;
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

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const category = (url.searchParams.get("category") || "all").trim();
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = 6;
  const offset = (page - 1) * limit;

  const db = getDatabase(context);

  // The filter row is derived from what is actually published, so a new
  // discipline shows up the moment its first case study goes live.
  const fallbackCategories = [
    "all",
    "Branding",
    "Social Media",
    "Print",
    "Packaging",
    "Environmental",
    "Institutional",
  ];

  if (db) {
    try {
      const categoryRows = await db
        .selectDistinct({ category: caseStudies.category })
        .from(caseStudies)
        .where(eq(caseStudies.published, true));

      const published = categoryRows
        .map((row) => row.category)
        .filter((value): value is string => Boolean(value))
        .sort((a, b) => a.localeCompare(b));

      const allCategories = published.length > 0 ? ["all", ...published] : fallbackCategories;

      const conditions: any[] = [eq(caseStudies.published, true)];

      if (category !== "all") {
        conditions.push(eq(caseStudies.category, category));
      }

      if (q) {
        const queryTerm = `%${q}%`;
        conditions.push(
          or(
            like(caseStudies.title, queryTerm),
            like(caseStudies.client, queryTerm),
            like(caseStudies.tagline, queryTerm),
            like(caseStudies.industry, queryTerm),
            like(caseStudies.category, queryTerm)
          )
        );
      }

      const whereClause = and(...conditions);

      const totalResult = await db
        .select({ value: count() })
        .from(caseStudies)
        .where(whereClause);

      const totalCount = totalResult[0]?.value || 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      const rows = await db
        .select()
        .from(caseStudies)
        .where(whereClause)
        .orderBy(desc(caseStudies.year), caseStudies.client)
        .limit(limit)
        .offset(offset);

      const parsedItems: ParsedCaseStudy[] = rows.map((r) => ({
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
        galleryImages: safeParseJson<Array<string | { src: string; caption?: string }>>(
          r.galleryImages,
          []
        ),
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
      }));

      return {
        items: parsedItems,
        totalCount,
        totalPages,
        currentPage: page,
        currentCategory: category,
        currentQuery: q,
        categories: allCategories,
      };
    } catch (err) {
      console.error("D1 query error in case-study loader:", err);
    }
  }

  return {
    items: [] as ParsedCaseStudy[],
    totalCount: 0,
    totalPages: 1,
    currentPage: page,
    currentCategory: category,
    currentQuery: q,
    categories: fallbackCategories,
  };
}

const ARROW = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 17L17 7M17 7H8M17 7V16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CaseStudyPage({ loaderData }: Route.ComponentProps) {
  const {
    items,
    totalCount,
    totalPages,
    currentPage,
    currentCategory,
    currentQuery,
    categories,
  } = loaderData;

  const [searchParams] = useSearchParams();
  const currentView = searchParams.get("view") === "list" ? "list" : "grid";

  function makeUrl(overrides: { q?: string; category?: string; page?: number; view?: string }) {
    const params = new URLSearchParams(searchParams);
    if (overrides.q !== undefined) {
      if (overrides.q) params.set("q", overrides.q);
      else params.delete("q");
    }
    if (overrides.category !== undefined) {
      if (overrides.category && overrides.category !== "all") {
        params.set("category", overrides.category);
      } else {
        params.delete("category");
      }
    }
    if (overrides.page !== undefined) {
      if (overrides.page > 1) params.set("page", String(overrides.page));
      else params.delete("page");
    }
    if (overrides.view !== undefined) {
      if (overrides.view === "list") params.set("view", "list");
      else params.delete("view");
    }
    const queryStr = params.toString();
    return queryStr ? `?${queryStr}` : "";
  }

  const pageOffset = (currentPage - 1) * 6;

  return (
    <ShellLayout activeSection="case-study">
      <main className="main">
        <div className="content-head">
          <Reveal as="p" className="eyebrow" variant="fade">
            Strategy. Identity. Architecture.
          </Reveal>
          <Reveal variant="mask">
            <h1 className="h-hero">
              Case
              <br />
              Studies
              <span className="rule" aria-hidden="true" />
            </h1>
          </Reveal>
          <Reveal as="p" className="lede" variant="up" delay={0.08}>
            Real brands. Real friction. The architectural systems and campaigns that moved them from
            commodity to high-tension industry leaders.
          </Reveal>
        </div>

        <div className="index-bar">
          <Form method="get" className="studio-search-bar" role="search">
            {currentCategory !== "all" && (
              <input type="hidden" name="category" value={currentCategory} />
            )}
            {currentView === "list" && <input type="hidden" name="view" value="list" />}
            <svg
              className="studio-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={currentQuery}
              placeholder="Search by client, industry, keyword…"
              className="studio-search-input"
              aria-label="Search case studies"
            />
            {currentQuery && (
              <Link
                to={makeUrl({ q: "", page: 1 })}
                className="studio-search-clear"
                title="Clear search"
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
                </svg>
              </Link>
            )}
          </Form>

          <div className="filters" role="tablist" aria-label="Filter case studies by category">
            {categories.map((cat) => {
              const isActive =
                (cat === "all" && currentCategory === "all") ||
                currentCategory.toLowerCase() === cat.toLowerCase();
              return (
                <Link
                  key={cat}
                  to={makeUrl({ category: cat, page: 1 })}
                  className={isActive ? "is-active" : ""}
                  role="tab"
                  aria-selected={isActive}
                >
                  {cat === "all" ? "All Disciplines" : cat}
                </Link>
              );
            })}
          </div>

          <div className="case-view-switch" role="group" aria-label="View layout switch">
            <Link
              to={makeUrl({ view: "grid" })}
              className={`case-view-btn ${currentView === "grid" ? "is-active" : ""}`}
              aria-label="Grid view"
              title="Grid view"
              preventScrollReset
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Grid</span>
            </Link>
            <Link
              to={makeUrl({ view: "list" })}
              className={`case-view-btn ${currentView === "list" ? "is-active" : ""}`}
              aria-label="List view"
              title="List view"
              preventScrollReset
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>List</span>
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="case-empty-state">
            <h2 className="case-empty-state__title">No Case Studies Found</h2>
            <p className="case-empty-state__text">
              Nothing matched {currentQuery ? `“${currentQuery}”` : "this filter"}
              {currentCategory !== "all" ? ` in ${currentCategory}` : ""}.
            </p>
            <Link to="/case-study" className="link-arrow">
              Reset filters
              {ARROW}
            </Link>
          </div>
        ) : currentView === "list" ? (
          <div className="cs-list">
            {items.map((item, index) => (
              <Reveal key={item.id} as="div" variant="up" delay={Math.min(index, 3) * 0.05}>
                <Link to={`/case-study/${item.slug}`} className="cs-row">
                  <span className="cs-row__num">{String(pageOffset + index + 1).padStart(2, "0")}</span>

                  <span className="cs-row__media">
                    {item.heroImage ? (
                      <img src={item.heroImage} alt="" loading="lazy" />
                    ) : (
                      <BrandPlate
                        client={item.client}
                        category={item.category}
                        index={pageOffset + index + 1}
                      />
                    )}
                  </span>

                  <span className="cs-row__body">
                    <span className="cs-row__eyebrow">{item.category}</span>
                    <span className="cs-row__client">{item.client}</span>
                    <span className="cs-row__title">{item.title}</span>
                  </span>

                  <span className="cs-row__extra">
                    <span>{item.industry}</span>
                    <span>{item.year}</span>
                  </span>

                  <span className="cs-row__arrow" aria-hidden="true">
                    {ARROW}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="cs-index">
            {items.map((item, index) => {
              const topResult = item.results?.[0];
              const number = String(pageOffset + index + 1).padStart(2, "0");

              return (
                <Reveal key={item.id} variant="up" delay={Math.min(index, 3) * 0.06}>
                  <Link
                    to={`/case-study/${item.slug}`}
                    className="cs-card"
                    data-cursor="view"
                    data-cursor-label="View"
                  >
                    <span className="cs-card__media">
                      {item.heroImage ? (
                        <img
                          className="cs-card__img"
                          src={item.heroImage}
                          alt={`${item.client} — ${item.title}`}
                          loading="lazy"
                        />
                      ) : (
                        <BrandPlate
                          client={item.client}
                          category={item.category}
                          industry={item.industry}
                          year={item.year}
                          index={pageOffset + index + 1}
                        />
                      )}

                      {item.clientLogo && (
                        <span className="cs-card__badge">
                          <img src={item.clientLogo} alt={`${item.client} logo`} loading="lazy" />
                        </span>
                      )}
                    </span>

                    <span className="cs-card__body">
                      <span className="cs-card__num">
                        {number} · {item.year}
                      </span>
                      <span className="cs-card__client">{item.client}</span>
                      <span className="cs-card__rule" aria-hidden="true" />
                      <span className="cs-card__title">{item.title}</span>
                      <span className="cs-card__line">{item.tagline}</span>

                      <span className="cs-card__foot">
                        <span className="cs-card__meta">
                          <span>{item.category}</span>
                          {topResult && <span>{topResult.value}</span>}
                        </span>
                        <span className="cs-card__arrow" aria-hidden="true">
                          {ARROW}
                        </span>
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="studio-pagination">
            <span className="studio-pagination__info">
              Showing {pageOffset + 1}–{Math.min(currentPage * 6, totalCount)} of {totalCount} Case
              Studies
            </span>
            <div className="studio-pagination__controls">
              {currentPage > 1 ? (
                <Link to={makeUrl({ page: currentPage - 1 })} className="studio-pagination__btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Link>
              ) : (
                <button type="button" disabled className="studio-pagination__btn">
                  Previous
                </button>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Link
                  key={pageNum}
                  to={makeUrl({ page: pageNum })}
                  className={`studio-pagination__btn ${pageNum === currentPage ? "is-active" : ""}`}
                >
                  {pageNum}
                </Link>
              ))}

              {currentPage < totalPages ? (
                <Link to={makeUrl({ page: currentPage + 1 })} className="studio-pagination__btn">
                  Next
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <button type="button" disabled className="studio-pagination__btn">
                  Next
                </button>
              )}
            </div>
          </div>
        )}

        <Footline
          links={[
            { href: "/works", label: "Works Archive" },
            { href: "/contact", label: "Contact" },
          ]}
        />
      </main>
    </ShellLayout>
  );
}
