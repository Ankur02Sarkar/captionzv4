export interface GalleryItem {
  src: string;
  alt: string;
  hi?: string | null;
}

export interface ColorPillar {
  name: string;
  color: string;
  desc: string;
}

export interface WorkItem {
  slug: string;
  num: string;
  name: string;
  title: string;
  metaDescription: string;
  sector: string;
  eyebrow?: string | null;
  category: "branding" | "print" | "events" | "digital";
  tag: string;
  isPhoto: boolean;
  thumb: string;
  tint?: string | null;
  intro: string;
  isCaseStudy: boolean;
  brandLogo?: string | null;
  coverImage?: { src: string; alt: string } | null;
  quote?: { text: string; attr: string } | null;
  notes: string[];
  colorPillars?: ColorPillar[] | null;
  ledeParagraphs: string[];
  gallery: GalleryItem[];
  nextLink?: { slug: string; href: string; label: string; name: string } | null;
  backLink: { href: string; label: string };
}
