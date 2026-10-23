import { Form, Link } from "react-router";
import { BrandPlate } from "../Common/BrandPlate";
import { Reveal } from "../Motion/Reveal";
import type { CaseStudyIndexData } from "../../lib/case-studies";

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

const CARD_ARROW = (
  <svg width="30" height="16" viewBox="0 0 30 16" fill="none" aria-hidden="true">
    <path
      d="M1 8h27M21.5 1.5 28 8l-6.5 6.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export type UrlOverrides = {
  q?: string;
  category?: string;
  page?: number;
  view?: string;
};

interface CaseStudyIndexProps {
  data: CaseStudyIndexData;
  view: "grid" | "list";
  makeUrl: (overrides: UrlOverrides) => string;
  showPagination?: boolean;
}

/**
 * The body of the case-study index. Rendered by /case-study, and again by the
 * home page's reveal layer — identical markup in both places is what makes the
 * veil hand-off invisible.
 */
export function CaseStudyIndex({
  data,
  view,
  makeUrl,
  showPagination = true,
}: CaseStudyIndexProps) {
  const { items, totalCount, totalPages, currentPage, currentCategory, currentQuery, categories } =
    data;

  const pageOffset = (currentPage - 1) * 6;

  return (
    <>
      <div className="case-index-head">
        <div className="content-head content-head--index">
          <Reveal as="p" className="eyebrow" variant="fade">
            Strategy. Identity. Architecture.
          </Reveal>
          <Reveal variant="mask">
            <h1 className="h-hero">
              Case Studies
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
            {view === "list" && <input type="hidden" name="view" value="list" />}
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
              className={`case-view-btn ${view === "grid" ? "is-active" : ""}`}
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
              className={`case-view-btn ${view === "list" ? "is-active" : ""}`}
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
      ) : view === "list" ? (
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
                  </span>

                  <span className="cs-card__body">
                    <span className="cs-card__num">{number}</span>
                    <span className="cs-card__client">{item.client}</span>
                    <span className="cs-card__rule" aria-hidden="true" />
                    <span className="cs-card__line">{item.tagline}</span>
                    <span className="cs-card__arrow" aria-hidden="true">
                      {CARD_ARROW}
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}

      {showPagination && totalPages > 1 && (
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
    </>
  );
}
