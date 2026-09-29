import { Link, useSearchParams, Form } from "react-router";
import type { Route } from "./+types/case-study";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { Footline } from "../components/Common/Footline";
import { getDatabase } from "../db/getDb";
import { caseStudies, type CaseStudy as DbCaseStudy } from "../db/schema";
import { eq, or, like, and, count, desc } from "drizzle-orm";
import caseStudiesFallback from "../../casestudies.json";

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

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const category = (url.searchParams.get("category") || "all").trim();
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = 6;
  const offset = (page - 1) * limit;

  const db = getDatabase(context);

  const allCategories = [
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

  // Graceful fallback from casestudies.json
  const rawList: any[] = caseStudiesFallback;
  let filtered = rawList.filter((item) => item.published !== false);

  if (category !== "all") {
    filtered = filtered.filter(
      (item) => item.category?.toLowerCase() === category.toLowerCase()
    );
  }

  if (q) {
    filtered = filtered.filter((item) => {
      const haystack = `${item.title} ${item.client} ${item.tagline} ${item.industry} ${item.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const paged = filtered.slice(offset, offset + limit).map((r) => ({
    id: r.id,
    slug: r.slug,
    client: r.client,
    title: r.title,
    industry: r.industry,
    category: r.category,
    year: r.year,
    tagline: r.tagline,
    heroImage: r.heroImage,
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
  }));

  return {
    items: paged,
    totalCount,
    totalPages,
    currentPage: page,
    currentCategory: category,
    currentQuery: q,
    categories: allCategories,
  };
}

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

  function makeUrl(overrides: { q?: string; category?: string; page?: number }) {
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
    const queryStr = params.toString();
    return queryStr ? `?${queryStr}` : "";
  }

  return (
    <ShellLayout activeSection="case-study">
      <main className="main">
        <div className="content-head reveal">
          <p className="eyebrow">Strategy. Identity. Architecture.</p>
          <h1 className="h-hero">
            Case
            <br />
            Studies
            <span className="rule" aria-hidden="true"></span>
          </h1>
          <p className="lede">
            Real brands. Real friction. The architectural systems and campaigns
            that moved them from commodity to high-tension industry leaders.
          </p>
        </div>

        {/* Search Bar */}
        <div className="reveal d1">
          <Form method="get" className="studio-search-bar" role="search">
            {currentCategory !== "all" && (
              <input type="hidden" name="category" value={currentCategory} />
            )}
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
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={currentQuery}
              placeholder="Search case studies by client, industry, keywords..."
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Link>
            )}
          </Form>
        </div>

        {/* Category Filters */}
        <div className="filters reveal d1" role="tablist" aria-label="Filter case studies by category">
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
                style={{ textDecoration: "none" }}
              >
                {cat === "all" ? "All Disciplines" : cat}
              </Link>
            );
          })}
        </div>

        {/* Case Studies Grid or Empty State */}
        {items.length === 0 ? (
          <div className="case-empty-state reveal">
            <h2 className="case-empty-state__title">No Case Studies Found</h2>
            <p className="case-empty-state__text">
              No project matched your filter "{currentCategory}" {currentQuery ? `and query "${currentQuery}"` : ""}.
            </p>
            <Link
              to="/case-study"
              className="link-arrow"
              style={{ display: "inline-flex" }}
            >
              Reset Filters
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
        ) : (
          <div className="case-grid">
            {items.map((item, index) => {
              const delays = ["", "d1", "d2"];
              const delayClass = delays[index % 3] || "";
              const topResult = item.results && item.results.length > 0 ? item.results[0] : null;

              return (
                <Link
                  key={item.id}
                  to={`/case-study/${item.slug}`}
                  className={`case-card reveal ${delayClass}`}
                  viewTransition
                >
                  <div className="case-card__plate">
                    <img
                      src={item.heroImage}
                      alt={`${item.client} — ${item.title}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="case-card__body">
                    <div className="case-card__meta-bar">
                      <span className="case-card__category">{item.category}</span>
                      <span className="case-card__year">{item.year}</span>
                    </div>

                    <h2 className="case-card__name">{item.client}</h2>
                    <h3 className="case-card__title">{item.title}</h3>
                    <p className="case-card__line">{item.tagline}</p>

                    {topResult && (
                      <div className="case-card__results-preview">
                        <span className="case-card__result-badge">
                          {topResult.value} — {topResult.label}
                        </span>
                      </div>
                    )}

                    {item.deliverables && item.deliverables.length > 0 && (
                      <div className="case-card__deliverables">
                        {item.deliverables.slice(0, 3).map((d) => (
                          <span key={d} className="case-card__deliverable-tag">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="link-arrow" style={{ alignSelf: "flex-start", marginTop: "12px" }}>
                      View Case Study
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 17L17 7M17 7H8M17 7V16"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Architectural Pagination */}
        {totalPages > 1 && (
          <div className="studio-pagination reveal">
            <span className="studio-pagination__info">
              Showing {(currentPage - 1) * 6 + 1}–{Math.min(currentPage * 6, totalCount)} of {totalCount} Case Studies
            </span>
            <div className="studio-pagination__controls">
              {currentPage > 1 ? (
                <Link
                  to={makeUrl({ page: currentPage - 1 })}
                  className="studio-pagination__btn"
                  viewTransition
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  viewTransition
                >
                  {pageNum}
                </Link>
              ))}

              {currentPage < totalPages ? (
                <Link
                  to={makeUrl({ page: currentPage + 1 })}
                  className="studio-pagination__btn"
                  viewTransition
                >
                  Next
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
