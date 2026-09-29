import { Link, useSearchParams, Form } from "react-router";
import type { Route } from "./+types/works";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { Footline } from "../components/Common/Footline";
import { getDatabase } from "../db/getDb";
import { works, type Work as DbWork } from "../db/schema";
import { eq, or, like, and, count, asc } from "drizzle-orm";
import { worksData as fallbackWorksData, type WorkItem } from "../data/worksData";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Works — Captionz" },
    {
      name: "description",
      content:
        "A selection of branding, print, packaging, digital and event works by Captionz.",
    },
  ];
}

type FilterCategory = "all" | "branding" | "print" | "events" | "digital";

interface WorkDisplayItem {
  slug: string;
  num: string;
  name: string;
  sector: string;
  category: string;
  tag: string;
  isPhoto: boolean;
  thumb: string;
  tint?: string | null;
  intro: string;
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const category = (url.searchParams.get("category") || "all").trim().toLowerCase() as FilterCategory;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = 6;
  const offset = (page - 1) * limit;

  const filterTabs: Array<{ id: FilterCategory; label: string }> = [
    { id: "all", label: "All Works" },
    { id: "branding", label: "Branding" },
    { id: "print", label: "Print & Packaging" },
    { id: "events", label: "Events" },
    { id: "digital", label: "Digital" },
  ];

  const db = getDatabase(context);

  if (db) {
    try {
      const conditions: any[] = [];

      if (category !== "all") {
        conditions.push(eq(works.category, category));
      }

      if (q) {
        const queryTerm = `%${q}%`;
        conditions.push(
          or(
            like(works.name, queryTerm),
            like(works.title, queryTerm),
            like(works.sector, queryTerm),
            like(works.intro, queryTerm),
            like(works.tag, queryTerm),
            like(works.category, queryTerm)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const totalResult = await db
        .select({ value: count() })
        .from(works)
        .where(whereClause);

      const totalCount = totalResult[0]?.value || 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      const rows = await db
        .select({
          slug: works.slug,
          num: works.num,
          name: works.name,
          sector: works.sector,
          category: works.category,
          tag: works.tag,
          isPhoto: works.isPhoto,
          thumb: works.thumb,
          tint: works.tint,
          intro: works.intro,
        })
        .from(works)
        .where(whereClause)
        .orderBy(asc(works.num))
        .limit(limit)
        .offset(offset);

      return {
        items: rows as WorkDisplayItem[],
        totalCount,
        totalPages,
        currentPage: page,
        currentCategory: category,
        currentQuery: q,
        filterTabs,
      };
    } catch (err) {
      console.error("D1 query error in works loader:", err);
    }
  }

  // Graceful fallback from worksData.ts
  let filtered = fallbackWorksData;

  if (category !== "all") {
    filtered = filtered.filter((work) => work.category === category);
  }

  if (q) {
    filtered = filtered.filter((work) => {
      const haystack = `${work.name} ${work.title} ${work.sector} ${work.intro} ${work.tag}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const paged = filtered.slice(offset, offset + limit).map((w) => ({
    slug: w.slug,
    num: w.num,
    name: w.name,
    sector: w.sector,
    category: w.category,
    tag: w.tag,
    isPhoto: w.isPhoto,
    thumb: w.thumb,
    tint: w.tint,
    intro: w.intro,
  }));

  return {
    items: paged,
    totalCount,
    totalPages,
    currentPage: page,
    currentCategory: category,
    currentQuery: q,
    filterTabs,
  };
}

export default function Works({ loaderData }: Route.ComponentProps) {
  const {
    items,
    totalCount,
    totalPages,
    currentPage,
    currentCategory,
    currentQuery,
    filterTabs,
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
    <ShellLayout activeSection="works">
      <main className="main">
        <div className="content-head reveal" style={{ maxWidth: "none", paddingBottom: "10px" }}>
          <p className="eyebrow">Works That Worked</p>
          <h1 className="h-hero">
            Works
            <span className="rule" aria-hidden="true"></span>
          </h1>
          <p className="lede">
            A few of our clients term our creatives as their marketing executives.
            Do call us if you want to know why.
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
              placeholder="Search works by client name, sector, service..."
              className="studio-search-input"
              aria-label="Search works"
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
        <div className="filters reveal d1" role="tablist" aria-label="Filter works by category">
          {filterTabs.map((tab) => {
            const isActive = currentCategory === tab.id;
            return (
              <Link
                key={tab.id}
                to={makeUrl({ category: tab.id, page: 1 })}
                className={isActive ? "is-active" : ""}
                role="tab"
                aria-selected={isActive}
                style={{ textDecoration: "none" }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Works Index or Empty State */}
        {items.length === 0 ? (
          <div className="case-empty-state reveal">
            <h2 className="case-empty-state__title">No Works Found</h2>
            <p className="case-empty-state__text">
              No project matched your filter "{currentCategory}" {currentQuery ? `and query "${currentQuery}"` : ""}.
            </p>
            <Link
              to="/works"
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
          <div className="work-index reveal d2">
            {items.map((work) => (
              <Link
                key={work.slug}
                to={`/work/${work.slug}`}
                className="work-row"
                data-category={work.category}
                style={work.tint ? ({ "--tint": work.tint } as React.CSSProperties) : undefined}
                viewTransition
              >
                <span className="work-row__num">{work.num}</span>
                <span
                  className={`work-row__plate ${
                    work.isPhoto ? "work-row__plate--photo" : ""
                  }`}
                >
                  <img
                    src={work.thumb}
                    alt={`${work.name} logo`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </span>
                <span className="work-row__text">
                  <span className="work-row__name">{work.name}</span>
                  <span className="work-row__sector">{work.sector}</span>
                  <span className="work-row__intro">{work.intro}</span>
                </span>
                <span className="work-row__tag">{work.tag}</span>
                <svg
                  className="work-row__arrow"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7 17L17 7M17 7H8M17 7V16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}
          </div>
        )}

        {/* Architectural Pagination */}
        {totalPages > 1 && (
          <div className="studio-pagination reveal">
            <span className="studio-pagination__info">
              Showing {(currentPage - 1) * 6 + 1}–{Math.min(currentPage * 6, totalCount)} of {totalCount} Works
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

        <div className="works-also reveal">
          <span className="works-also__label">Film &amp; Video</span>
          <div className="works-also__list">
            <span>Branding/TVC</span>
            <span>Wedding Express</span>
            <span>Sandhya</span>
            <span>Dr. Ace</span>
            <span>Jedhru</span>
            <span>Behind the Scenes</span>
            <span>Maqdoom's</span>
            <span>Media Coverage in Haryana</span>
            <span>Metalika</span>
          </div>
          <a
            className="link-arrow"
            style={{ marginTop: "22px" }}
            href="https://www.captionz.biz/videos"
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch on captionz.biz
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 17L17 7M17 7H8M17 7V16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        <Footline
          links={[
            { href: "/case-study", label: "Case Study" },
            { href: "/contact", label: "Contact" },
          ]}
        />
      </main>
    </ShellLayout>
  );
}
