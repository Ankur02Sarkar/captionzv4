import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Primary application routes
  index("routes/home.tsx"),
  route("case-study", "routes/case-study.tsx"),
  route("works", "routes/works.tsx"),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),
  route("work/:slug", "routes/work-detail.tsx"),

  // Backward-compatibility aliases for .html URLs with explicit route IDs
  route("index.html", "routes/home.tsx", { id: "home-html" }),
  route("case-study.html", "routes/case-study.tsx", { id: "case-study-html" }),
  route("works.html", "routes/works.tsx", { id: "works-html" }),
  route("about.html", "routes/about.tsx", { id: "about-html" }),
  route("contact.html", "routes/contact.tsx", { id: "contact-html" }),
] satisfies RouteConfig;
