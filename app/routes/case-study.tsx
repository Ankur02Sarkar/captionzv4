import { useLocation, useSearchParams } from "react-router";
import type { Route } from "./+types/case-study";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { Footline } from "../components/Common/Footline";
import { CaseStudyIndex, type UrlOverrides } from "../components/CaseStudy/CaseStudyIndex";
import { RevealImmediateContext } from "../components/Motion/Reveal";
import { getDatabase } from "../db/getDb";
import { emptyCaseStudyIndex, getCaseStudyIndex } from "../lib/case-studies";

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

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const category = (url.searchParams.get("category") || "all").trim();
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));

  const db = getDatabase(context);
  if (!db) return emptyCaseStudyIndex(page, category, q);

  return getCaseStudyIndex(db, { page, category, q });
}

export default function CaseStudyPage({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Arriving from the home page's scroll reveal: the visitor has already seen
  // this page fully formed, so entrance animations must not replay.
  const seamless = Boolean(
    (location.state as { seamless?: boolean } | null)?.seamless
  );

  const currentView = searchParams.get("view") === "list" ? "list" : "grid";

  function makeUrl(overrides: UrlOverrides) {
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

  return (
    <RevealImmediateContext.Provider value={seamless}>
      <ShellLayout activeSection="case-study">
        <main className="main">
          <CaseStudyIndex
            data={loaderData}
            view={currentView}
            makeUrl={makeUrl}
            showPagination
          />

          <Footline
            links={[
              { href: "/works", label: "Works Archive" },
              { href: "/contact", label: "Contact" },
            ]}
          />
        </main>
      </ShellLayout>
    </RevealImmediateContext.Provider>
  );
}
