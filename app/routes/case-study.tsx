import { Link } from "react-router";
import type { Route } from "./+types/case-study";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { Footline } from "../components/Common/Footline";
import { caseStudiesData } from "../data/caseStudiesData";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Case Study — Captionz" },
    {
      name: "description",
      content:
        "In-depth stories of brands Captionz has partnered with to solve challenges, build meaning and create lasting impact.",
    },
  ];
}

export default function CaseStudy() {
  const delays = ["", "d1", "d2"];

  return (
    <ShellLayout activeSection="case-study">
      <main className="main">
        <div className="content-head reveal">
          <p className="eyebrow">Strategy. Identity. Experience.</p>
          <h1 className="h-hero">
            Case
            <br />
            Study
            <span className="rule" aria-hidden="true"></span>
          </h1>
          <p className="lede">
            Three brands. Three different problems. The work that moved each of them
            from a name to a brand.
          </p>
        </div>

        <div className="case-grid">
          {caseStudiesData.map((item, index) => (
            <Link
              key={item.slug}
              to={item.href}
              className={`case-card reveal ${delays[index] || ""}`}
              style={{ "--tint": item.tint } as React.CSSProperties}
              viewTransition
            >
              <div className="case-card__plate">
                <img src={item.logo} alt={`${item.name} logo`} />
              </div>
              <div className="case-card__body">
                <h2 className="case-card__name">{item.name}</h2>
                <p className="case-card__line">{item.line}</p>
                <span className="link-arrow" style={{ alignSelf: "flex-start" }}>
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
          ))}
        </div>

        <Footline
          links={[
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
          ]}
        />
      </main>
    </ShellLayout>
  );
}
