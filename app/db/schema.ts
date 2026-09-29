import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const caseStudies = sqliteTable("case_studies", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  client: text("client").notNull(),
  title: text("title").notNull(),
  industry: text("industry").notNull(),
  category: text("category").notNull(),
  year: integer("year").notNull(),
  tagline: text("tagline").notNull(),
  heroImage: text("hero_image").notNull(),
  galleryImages: text("gallery_images"), // JSON string array of URLs
  overview: text("overview").notNull(),
  challenge: text("challenge").notNull(),
  strategy: text("strategy").notNull(),
  results: text("results"), // JSON string array of { label: string; value: string }
  testimonial: text("testimonial"), // JSON string of { quote: string; title: string; author: string }
  deliverables: text("deliverables"), // JSON string array of string
  externalUrl: text("external_url"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export type CaseStudy = typeof caseStudies.$inferSelect;
export type NewCaseStudy = typeof caseStudies.$inferInsert;

export const works = sqliteTable("works", {
  slug: text("slug").primaryKey(),
  num: text("num").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  metaDescription: text("meta_description").notNull(),
  sector: text("sector").notNull(),
  eyebrow: text("eyebrow"),
  category: text("category").notNull(),
  tag: text("tag").notNull(),
  isPhoto: integer("is_photo", { mode: "boolean" }).notNull().default(false),
  thumb: text("thumb").notNull(),
  tint: text("tint"),
  intro: text("intro").notNull(),
  isCaseStudy: integer("is_case_study", { mode: "boolean" }).notNull().default(false),
  brandLogo: text("brand_logo"),
  coverImage: text("cover_image"), // JSON string: { src: string; alt: string }
  quote: text("quote"), // JSON string: { text: string; attr: string }
  notes: text("notes"), // JSON string array: string[]
  colorPillars: text("color_pillars"), // JSON string array: ColorPillar[]
  ledeParagraphs: text("lede_paragraphs"), // JSON string array: string[]
  gallery: text("gallery"), // JSON string array: GalleryItem[]
  nextLink: text("next_link"), // JSON string: { slug: string; href: string; label: string; name: string }
  backLink: text("back_link"), // JSON string: { href: string; label: string }
});

export type Work = typeof works.$inferSelect;
export type NewWork = typeof works.$inferInsert;
