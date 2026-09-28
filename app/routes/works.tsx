import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/works";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { Footline } from "../components/Common/Footline";
import { worksData } from "../data/worksData";

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

export default function Works() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const filterTabs: Array<{ id: FilterCategory; label: string }> = [
    { id: "all", label: "All Works" },
    { id: "branding", label: "Branding" },
    { id: "print", label: "Print & Packaging" },
    { id: "events", label: "Events" },
    { id: "digital", label: "Digital" },
  ];

  const filteredWorks = worksData.filter((work) => {
    if (activeFilter === "all") return true;
    return work.category === activeFilter;
  });

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

        <div className="filters reveal d1" role="tablist" aria-label="Filter works by category">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              className={activeFilter === tab.id ? "is-active" : ""}
              onClick={() => setActiveFilter(tab.id)}
              role="tab"
              aria-selected={activeFilter === tab.id}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="work-index reveal d2">
          {filteredWorks.map((work) => (
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
