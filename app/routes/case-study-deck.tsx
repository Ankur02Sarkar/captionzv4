import type { Route } from "./+types/case-study-deck";
import { eq } from "drizzle-orm";
import { getDatabase } from "../db/getDb";
import { caseStudies } from "../db/schema";
import "../styles/deck.css";

interface GalleryImage {
  src: string;
  caption?: string;
}

interface DeckResult {
  label: string;
  value: string;
}

interface DeckTestimonial {
  quote: string;
  title: string;
  author: string;
}

interface DeckStudy {
  slug: string;
  client: string;
  title: string;
  industry: string;
  category: string;
  year: number;
  tagline: string;
  heroImage: string;
  galleryImages: GalleryImage[];
  overview: string;
  challenge: string;
  strategy: string;
  results: DeckResult[];
  testimonial: DeckTestimonial | null;
  deliverables: string[];
}

function safeParseJson<T>(raw: unknown, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === "object") return raw as T;
  try {
    return JSON.parse(String(raw)) as T;
  } catch {
    return fallback;
  }
}

function normaliseGallery(raw: unknown): GalleryImage[] {
  const parsed = safeParseJson<unknown>(raw, []);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((entry): GalleryImage | null => {
      if (typeof entry === "string") return { src: entry };
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        const src = (record.src || record.url || record.image) as string | undefined;
        if (!src) return null;
        return { src, caption: (record.caption as string) || undefined };
      }
      return null;
    })
    .filter((entry): entry is GalleryImage => Boolean(entry?.src));
}

export async function loader({ params, context }: Route.LoaderArgs) {
  const slug = params.slug;
  if (!slug) throw new Response("Case Study Not Found", { status: 404 });

  const db = getDatabase(context);
  if (!db) throw new Response("Database unavailable", { status: 503 });

  const rows = await db
    .select()
    .from(caseStudies)
    .where(eq(caseStudies.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    throw new Response("Case Study Not Found", { status: 404 });
  }

  const row = rows[0];
  const study: DeckStudy = {
    slug: row.slug,
    client: row.client,
    title: row.title,
    industry: row.industry,
    category: row.category,
    year: row.year,
    tagline: row.tagline,
    heroImage: row.heroImage || "",
    galleryImages: normaliseGallery(row.galleryImages),
    overview: row.overview,
    challenge: row.challenge,
    strategy: row.strategy,
    results: safeParseJson<DeckResult[]>(row.results, []),
    testimonial: safeParseJson<DeckTestimonial | null>(row.testimonial, null),
    deliverables: safeParseJson<string[]>(row.deliverables, []),
  };

  return { study };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.study) {
    return [{ title: "Deck Not Found — Captionz" }];
  }
  return [
    { title: `${loaderData.study.client} — Case Study Deck — Captionz` },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

function initials(client: string) {
  return client
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function DeckMast({
  study,
  tone = "dark",
}: {
  study: DeckStudy;
  tone?: "dark" | "light";
}) {
  return (
    <div className={`deck-mast deck-mast--${tone}`}>
      <span className="deck-mast__brand">
        <span className="deck-mast__mark" aria-hidden="true">
          C
        </span>
        <span>
          <span className="deck-mast__word">Captionz</span>
          <span className="deck-mast__tag">Gateway of Branding</span>
        </span>
      </span>
      <span className="deck-mast__meta">
        {study.category} <span aria-hidden="true">/</span> {study.year}
      </span>
    </div>
  );
}

function DeckFoot({
  study,
  page,
  total,
  tone = "dark",
}: {
  study: DeckStudy;
  page: number;
  total: number;
  tone?: "dark" | "light";
}) {
  return (
    <div className={`deck-foot deck-foot--${tone}`}>
      <span>
        {study.client} <span aria-hidden="true">·</span> {study.category}
      </span>
      <span className="deck-foot__page">
        {String(page).padStart(2, "0")} <span aria-hidden="true">/</span>{" "}
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

function SlideHead({
  number,
  label,
  tone = "dark",
}: {
  number: string;
  label: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className={`deck-slide-head deck-slide-head--${tone}`}>
      <span className="deck-slide-head__num">{number}</span>
      <span className="deck-slide-head__label">{label}</span>
      <span className="deck-slide-head__rule" aria-hidden="true" />
    </div>
  );
}

function DeckPlate({ study, large = false }: { study: DeckStudy; large?: boolean }) {
  return (
    <div className={`deck-plate${large ? " deck-plate--large" : ""}`}>
      <span className="deck-plate__grid" aria-hidden="true" />
      <span className="deck-plate__index">{String(study.year)}</span>
      <span className="deck-plate__monogram">{initials(study.client)}</span>
      <span className="deck-plate__name">{study.client}</span>
      <span className="deck-plate__rule" aria-hidden="true" />
      <span className="deck-plate__category">{study.category}</span>
      <span className="deck-plate__industry">{study.industry}</span>
    </div>
  );
}

function Cover({ study, total }: { study: DeckStudy; total: number }) {
  return (
    <section className="deck-page deck-cover">
      <DeckMast study={study} />

      <div className="deck-cover__grid">
        <div className="deck-cover__copy">
          <p className="deck-kicker">Case Study / {study.year}</p>
          <h1 className="deck-cover__client">{study.client}</h1>
          <span className="deck-cover__rule" aria-hidden="true" />
          <p className="deck-cover__title">{study.title}</p>
          <p className="deck-cover__tagline">{study.tagline}</p>
        </div>

        <div className="deck-cover__visual">
          {study.heroImage ? (
            <img src={study.heroImage} alt={`${study.client} — ${study.title}`} />
          ) : (
            <DeckPlate study={study} large />
          )}
          <span className="deck-cover__stamp">
            <span>{study.category}</span>
            <span>{study.industry}</span>
          </span>
        </div>
      </div>

      <DeckFoot study={study} page={1} total={total} />
    </section>
  );
}

function BriefPage({ study, total }: { study: DeckStudy; total: number }) {
  return (
    <section className="deck-page deck-brief">
      <DeckMast study={study} />
      <SlideHead number="01" label="The Brief" />

      <div className="deck-brief__body">
        <div className="deck-brief__copy">
          <p className="deck-lead">{study.overview}</p>
          <div className="deck-facts">
            <span>
              <span className="deck-facts__label">Client</span>
              <span className="deck-facts__value">{study.client}</span>
            </span>
            <span>
              <span className="deck-facts__label">Sector</span>
              <span className="deck-facts__value">{study.industry}</span>
            </span>
            <span>
              <span className="deck-facts__label">Discipline</span>
              <span className="deck-facts__value">{study.category}</span>
            </span>
          </div>
        </div>

        <div className="deck-brief__aside">
          {study.heroImage ? (
            <img
              className="deck-brief__image"
              src={study.galleryImages[1]?.src || study.heroImage}
              alt=""
            />
          ) : (
            <DeckPlate study={study} />
          )}
          <p className="deck-brief__aside-note">{study.tagline}</p>
        </div>
      </div>

      <DeckFoot study={study} page={2} total={total} />
    </section>
  );
}

function FrictionPage({ study, total }: { study: DeckStudy; total: number }) {
  return (
    <section className="deck-page deck-page--ink deck-friction">
      <DeckMast study={study} tone="light" />
      <SlideHead number="02" label="The Friction" tone="light" />

      <div className="deck-friction__body">
        <span className="deck-friction__quote" aria-hidden="true">
          “
        </span>
        <p className="deck-friction__copy">{study.challenge}</p>
        <span className="deck-friction__ghost" aria-hidden="true">
          FRICTION
        </span>
      </div>

      <DeckFoot study={study} page={3} total={total} tone="light" />
    </section>
  );
}

function MovePage({ study, total }: { study: DeckStudy; total: number }) {
  return (
    <section className="deck-page deck-move">
      <DeckMast study={study} />
      <SlideHead number="03" label="The Move" />

      <div className="deck-move__body">
        <p className="deck-move__copy">{study.strategy}</p>

        <div className="deck-move__list">
          <span className="deck-move__list-label">What we built</span>
          {study.deliverables.map((item, index) => (
            <span className="deck-move__item" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      <DeckFoot study={study} page={4} total={total} />
    </section>
  );
}

function WorkPage({ study, total }: { study: DeckStudy; total: number }) {
  // Some galleries lead with product shots. Prefer the strongest application
  // spread so the deck reads as a body of work, not a product catalogue.
  const curatedWorkImages: Record<string, number[]> = {
    "little-buddy-branding": [4, 3, 7],
  };
  const gallery = study.galleryImages;
  const curated = curatedWorkImages[study.slug]
    ?.map((index) => gallery[index])
    .filter((image): image is GalleryImage => Boolean(image?.src));
  const images = curated?.length
    ? curated
    : gallery.filter((image) => image.src !== study.heroImage).slice(0, 3);
  const displayImages = images.length > 0 ? images.slice(0, 3) : gallery.slice(0, 3);
  const hasImages = displayImages.length > 0;

  return (
    <section className={`deck-page deck-work${hasImages ? "" : " deck-work--type"}`}>
      <DeckMast study={study} />
      <SlideHead number="04" label={hasImages ? "The Work" : "The System"} />

      {hasImages ? (
        <>
          <div className="deck-work__grid">
            {displayImages.map((image, index) => (
              <figure
                className={`deck-work__item deck-work__item--${index + 1}`}
                key={image.src}
              >
                <img src={image.src} alt={image.caption || `${study.client} application`} />
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {image.caption || "Selected application"}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="deck-work__note">
            <span className="deck-kicker">The system in use</span>
            <p>
              A coherent language across every surface — built to stay recognisable
              long after the launch.
            </p>
          </div>
        </>
      ) : (
        <div className="deck-system">
          <div className="deck-system__mark">
            <span className="deck-system__grid" aria-hidden="true" />
            <span className="deck-system__initials">{initials(study.client)}</span>
            <span className="deck-system__word">{study.client}</span>
            <span className="deck-system__rule" aria-hidden="true" />
            <span className="deck-system__meta">
              {study.category} / {study.industry}
            </span>
          </div>

          <div className="deck-system__copy">
            <span className="deck-kicker">A disciplined visual language</span>
            <p>{study.tagline}</p>
            <div className="deck-system__deliverables">
              {study.deliverables.map((item, index) => (
                <span key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <DeckFoot study={study} page={5} total={total} />
    </section>
  );
}

function OutcomePage({ study, total }: { study: DeckStudy; total: number }) {
  return (
    <section className="deck-page deck-outcome">
      <DeckMast study={study} />
      <SlideHead number="05" label="The Outcome" />

      <div className="deck-outcome__body">
        {study.results.map((result, index) => (
          <div className="deck-result" key={result.label}>
            <span className="deck-result__index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="deck-result__value">{result.value}</span>
            <span className="deck-result__label">{result.label}</span>
          </div>
        ))}
      </div>

      <p className="deck-outcome__note">
        The result was not a single asset. It was a brand system built to hold its
        shape as the business grew.
      </p>

      <DeckFoot study={study} page={6} total={total} />
    </section>
  );
}

function TestimonialPage({
  study,
  total,
}: {
  study: DeckStudy;
  total: number;
}) {
  const testimonial = study.testimonial;
  if (!testimonial) return null;

  return (
    <section className="deck-page deck-page--ink deck-testimonial">
      <DeckMast study={study} tone="light" />
      <SlideHead number="06" label="In Their Words" tone="light" />

      <div className="deck-testimonial__body">
        <span className="deck-testimonial__mark" aria-hidden="true">
          “
        </span>
        <blockquote>{testimonial.quote}</blockquote>
        <span className="deck-testimonial__rule" aria-hidden="true" />
        <p className="deck-testimonial__author">
          {testimonial.author}
          {testimonial.title ? <span>{testimonial.title}</span> : null}
        </p>
      </div>

      <DeckFoot study={study} page={7} total={total} tone="light" />
    </section>
  );
}

function ClosingPage({ study, total }: { study: DeckStudy; total: number }) {
  const page = study.testimonial ? 8 : 7;

  return (
    <section className="deck-page deck-page--red deck-closing">
      <div className="deck-closing__top">
        <span className="deck-closing__brand">Captionz</span>
        <span className="deck-closing__meta">
          {study.client} / {study.year}
        </span>
      </div>

      <div className="deck-closing__body">
        <p className="deck-kicker deck-kicker--light">Your Gateway Is Next</p>
        <h2 className="deck-closing__title">
          Every brand crosses
          <br />
          the same threshold:
          <br />
          from what it sells to
          <br />
          what it <em>means</em>.
        </h2>
      </div>

      <div className="deck-closing__bottom">
        <div>
          <span className="deck-closing__label">Start a conversation</span>
          <a href="mailto:capt@captionz.biz">capt@captionz.biz</a>
          <a href="tel:+919849818165">+91 98498 18165</a>
        </div>
        <div>
          <span className="deck-closing__label">Hyderabad Atelier</span>
          <p>
            301/301A, Suryakiran Complex
            <br />
            SD Road, Sec-bad
            <br />
            Hyderabad — 500003
          </p>
        </div>
        <div className="deck-closing__signoff">
          <span>Gateway of Branding</span>
          <span>
            {String(page).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}

export default function CaseStudyDeckPage({ loaderData }: Route.ComponentProps) {
  const { study } = loaderData;
  const total = study.testimonial ? 8 : 7;

  return (
    <main className="deck" aria-label={`${study.client} case study deck`}>
      <Cover study={study} total={total} />
      <BriefPage study={study} total={total} />
      <FrictionPage study={study} total={total} />
      <MovePage study={study} total={total} />
      <WorkPage study={study} total={total} />
      <OutcomePage study={study} total={total} />
      <TestimonialPage study={study} total={total} />
      <ClosingPage study={study} total={total} />
    </main>
  );
}
