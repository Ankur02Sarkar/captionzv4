import { and, count, desc, eq, like, or } from "drizzle-orm";
import { caseStudies } from "../db/schema";
import type { getDatabase } from "../db/getDb";

/**
 * The case-study index is rendered in two places: the /case-study route and the
 * "peek" layer on the home page that the veil scrolls away to reveal. Both must
 * receive byte-identical data and markup, otherwise the hand-off between them
 * would blink. Keep this query as the single source of truth.
 */
export interface CaseStudyIndexItem {
  id: string;
  slug: string;
  client: string;
  title: string;
  industry: string;
  category: string;
  year: number;
  tagline: string;
  heroImage: string;
}

export interface CaseStudyIndexData {
  items: CaseStudyIndexItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  currentCategory: string;
  currentQuery: string;
  categories: string[];
}

export interface CaseStudyIndexOptions {
  page?: number;
  category?: string;
  q?: string;
  limit?: number;
}

export const CASE_STUDY_PAGE_SIZE = 6;

export const FALLBACK_CATEGORIES = [
  "all",
  "Branding",
  "Social Media",
  "Print",
  "Packaging",
  "Environmental",
  "Institutional",
];

type Database = NonNullable<ReturnType<typeof getDatabase>>;

export function emptyCaseStudyIndex(
  page = 1,
  category = "all",
  q = "",
  categories = FALLBACK_CATEGORIES
): CaseStudyIndexData {
  return {
    items: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: page,
    currentCategory: category,
    currentQuery: q,
    categories,
  };
}

export async function getCaseStudyIndex(
  db: Database,
  options: CaseStudyIndexOptions = {}
): Promise<CaseStudyIndexData> {
  const page = Math.max(1, Math.floor(options.page ?? 1));
  const limit = options.limit ?? CASE_STUDY_PAGE_SIZE;
  const offset = (page - 1) * limit;
  const category = (options.category ?? "all").trim() || "all";
  const q = (options.q ?? "").trim().toLowerCase();

  try {
    // The filter row is derived from what is actually published, so a new
    // discipline shows up the moment its first case study goes live.
    const categoryRows = await db
      .selectDistinct({ category: caseStudies.category })
      .from(caseStudies)
      .where(eq(caseStudies.published, true));

    const published = categoryRows
      .map((row) => row.category)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => a.localeCompare(b));

    const categories = published.length > 0 ? ["all", ...published] : FALLBACK_CATEGORIES;

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
      })
      .from(caseStudies)
      .where(whereClause)
      .orderBy(desc(caseStudies.year), caseStudies.client)
      .limit(limit)
      .offset(offset);

    const items: CaseStudyIndexItem[] = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      client: row.client,
      title: row.title,
      industry: row.industry,
      category: row.category,
      year: row.year,
      tagline: row.tagline,
      heroImage: row.heroImage,
    }));

    return {
      items,
      totalCount,
      totalPages,
      currentPage: page,
      currentCategory: category,
      currentQuery: q,
      categories,
    };
  } catch (err) {
    console.error("D1 query error in case-study index:", err);
    return emptyCaseStudyIndex(page, category, q);
  }
}
