export interface CaseStudySummary {
  slug: string;
  name: string;
  logo: string;
  line: string;
  tint: string;
  href: string;
}

export const caseStudiesData: CaseStudySummary[] = [
  {
    slug: "la-belle",
    name: "La Belle",
    logo: "/assets/logo-labelle.png",
    line: "From advertising to experience — building a skin, hair and slimming brand people trust.",
    tint: "#077D7A",
    href: "/work/la-belle",
  },
  {
    slug: "minitech",
    name: "Minitech",
    logo: "/assets/logo-minitech.png",
    line: "From a local flooring player to a name people recognise before they recognise the founder.",
    tint: "#00215C",
    href: "/work/minitech",
  },
  {
    slug: "gofin",
    name: "Gofin",
    logo: "/assets/logo-gofin.png",
    line: "From loan anxiety to home happiness — building trust into a home-loan brand.",
    tint: "#00A3E9",
    href: "/work/gofin",
  },
];
