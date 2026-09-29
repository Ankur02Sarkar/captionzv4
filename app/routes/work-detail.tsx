import { Link } from "react-router";
import type { Route } from "./+types/work-detail";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { Footline } from "../components/Common/Footline";
import { HiResImage } from "../components/Common/HiResImage";
import { getDatabase } from "../db/getDb";
import { works } from "../db/schema";
import { eq } from "drizzle-orm";
import { worksBySlug, type WorkItem } from "../data/worksData";

function safeParseJson<T>(raw: any, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === "object") return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function loader({ params, context }: Route.LoaderArgs) {
  let slug = params.slug;
  if (!slug) {
    throw new Response("Project Not Found", { status: 404 });
  }

  // Handle .html suffix if present in URL
  if (slug.endsWith(".html")) {
    slug = slug.replace(/\.html$/, "");
  }

  const db = getDatabase(context);
  let work: WorkItem | null = null;

  if (db) {
    try {
      const rows = await db
        .select()
        .from(works)
        .where(eq(works.slug, slug))
        .limit(1);

      if (rows.length > 0) {
        const r = rows[0];
        work = {
          slug: r.slug,
          num: r.num,
          name: r.name,
          title: r.title,
          metaDescription: r.metaDescription,
          sector: r.sector,
          eyebrow: r.eyebrow,
          category: r.category as any,
          tag: r.tag,
          isPhoto: r.isPhoto,
          thumb: r.thumb,
          tint: r.tint,
          intro: r.intro,
          isCaseStudy: r.isCaseStudy,
          brandLogo: r.brandLogo,
          coverImage: safeParseJson(r.coverImage, null),
          quote: safeParseJson(r.quote, null),
          notes: safeParseJson(r.notes, []),
          colorPillars: safeParseJson(r.colorPillars, null),
          ledeParagraphs: safeParseJson(r.ledeParagraphs, []),
          gallery: safeParseJson(r.gallery, []),
          nextLink: safeParseJson(r.nextLink, null),
          backLink: safeParseJson(r.backLink, { href: "/works", label: "Back to Works" }),
        };
      }
    } catch (err) {
      console.error("D1 query error in work-detail loader:", err);
    }
  }

  if (!work) {
    work = worksBySlug.get(slug) || null;
  }

  if (!work) {
    throw new Response("Project Not Found", { status: 404 });
  }

  return { work };
}

export function meta({ params }: Route.MetaArgs) {
  let slug = params.slug?.replace(/\.html$/, "");
  const work = slug ? worksBySlug.get(slug) : undefined;
  if (!work) {
    return [{ title: "Work Not Found — Captionz" }];
  }
  return [
    { title: work.title || `${work.name} — Works — Captionz` },
    {
      name: "description",
      content: work.metaDescription || work.intro,
    },
  ];
}

export default function WorkDetail({ loaderData }: Route.ComponentProps) {
  const { work } = loaderData;

  return (
    <ShellLayout
      railMode="work"
      activeSection={work.isCaseStudy ? "case-study" : "works"}
    >
      <main className="main">
        <Link
          className="link-arrow"
          to={work.backLink.href}
          style={{ marginTop: "clamp(96px, 12vw, 148px)", border: "none" }}
          viewTransition
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            style={{ transform: "scaleX(-1)" }}
          >
            <path
              d="M7 17L17 7M17 7H8M17 7V16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {work.backLink.label}
        </Link>

        <div className="cd-intro reveal d1">
          {work.isCaseStudy && work.brandLogo ? (
            <div className="cd-intro__brand">
              <img src={work.brandLogo} alt={`${work.name} logo`} />
            </div>
          ) : work.eyebrow ? (
            <p className="eyebrow">{work.eyebrow}</p>
          ) : null}

          <h1 className="cd-intro__name">{work.name}</h1>

          {work.ledeParagraphs.length > 0 && (
            <div className="lede" style={{ marginTop: "16px" }}>
              {work.ledeParagraphs.map((para, i) => (
                <p key={i} style={i > 0 ? { marginTop: "14px" } : undefined}>
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>

        {work.isCaseStudy && (
          <>
            {work.coverImage && (
              <div className="cd-visual cd-visual--cover reveal d2">
                <img
                  src={work.coverImage.src}
                  alt={work.coverImage.alt}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
            )}

            {work.brandLogo && (
              <div className="cd-plate reveal">
                <img src={work.brandLogo} alt={`${work.name} logo mark`} />
              </div>
            )}

            {work.quote && (
              <div className="cd-quote reveal">
                <span className="cd-quote__mark">&ldquo;</span>
                <p className="cd-quote__text">{work.quote.text}</p>
                <span className="cd-quote__attr">{work.quote.attr}</span>
              </div>
            )}

            {work.notes.map((note, i) => (
              <p
                key={i}
                className="cd-note reveal"
                style={i > 0 ? { paddingTop: 0 } : undefined}
              >
                {note}
              </p>
            ))}

            {work.colorPillars && work.colorPillars.length > 0 && (
              <div className="gofin-pillars reveal">
                {work.colorPillars.map((pillar) => (
                  <div key={pillar.name} className="gofin-pillars__item">
                    <div
                      className="gofin-pillars__swatch"
                      style={{ background: pillar.color }}
                    ></div>
                    <div className="gofin-pillars__name">{pillar.name}</div>
                    <p className="gofin-pillars__desc">{pillar.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {work.gallery.length > 0 && (
          <div
            className={`gallery reveal ${work.isCaseStudy ? "" : "d2"}`}
            style={work.isCaseStudy ? { marginTop: "44px" } : undefined}
          >
            {work.gallery.map((item, idx) => (
              <figure key={idx} className="gallery__item">
                <HiResImage
                  src={item.src}
                  alt={item.alt}
                  hi={item.hi}
                  referrerPolicy="no-referrer"
                  loading={idx < 2 ? "eager" : "lazy"}
                />
              </figure>
            ))}
          </div>
        )}

        {work.nextLink && (
          <Link className="cd-next reveal" to={work.nextLink.href} viewTransition>
            <div>
              <span className="cd-next__label">{work.nextLink.label}</span>
              <div className="cd-next__name">{work.nextLink.name}</div>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "var(--red)" }}
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}

        <Footline
          links={
            work.isCaseStudy
              ? [
                  { href: "/works", label: "Works" },
                  { href: "/contact", label: "Contact" },
                ]
              : [
                  { href: "/case-study", label: "Case Study" },
                  { href: "/contact", label: "Contact" },
                ]
          }
        />
      </main>
    </ShellLayout>
  );
}
