import type { Route } from "./+types/about";
import { ShellLayout } from "../components/Layout/ShellLayout";
import { Footline } from "../components/Common/Footline";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About Us — Captionz" },
    {
      name: "description",
      content:
        "Captionz — thinking partners, not creative vendors. A decade of turning names into brands.",
    },
  ];
}

interface TeamMember {
  name: string;
  designation: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Capt. SN Ahmed",
    designation: "Founder, Managing Director & Creative Head",
    image: "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/team/sn-ahmed.jpg",
  },
  {
    name: "Syed Wajahath Ali",
    designation: "Art Director",
    image: "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/team/syed-wajahath-ali.jpg",
  },
  {
    name: "Lokesh Kumar Baisiwala",
    designation: "Business Head",
    image: "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/team/lokesh-kumar.jpg",
  },
  {
    name: "Zee",
    designation: "Graphic Designer",
    image: "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/team/zee.jpg",
  },
  {
    name: "Asim Shaikh",
    designation: "Sr. Graphic Designer",
    image: "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/team/asim-shaikh.jpg",
  },
];

export default function About() {
  return (
    <ShellLayout activeSection="about">
      <main className="main">
        <section className="about-hero">
          <div className="reveal">
            <p className="eyebrow">Who We Are</p>
            <h1 className="h-hero" style={{ fontSize: "clamp(40px,6vw,80px)" }}>
              About Us
            </h1>
            <p className="lede">
              A decade young, Captionz is built on an abundance of creative riches — from
              strategic thinking to the insight that turns a name into a brand.
            </p>
          </div>
          <div className="about-hero__frame reveal d2">
            <img
              src="/assets/about_gateway_room.jpg"
              alt="A sunlit marble hall with the red Captionz gateway standing at the top of a short flight of steps."
            />
          </div>
        </section>

        <section className="tp reveal">
          <div>
            <h2 className="tp__title">
              Thinking
              <br />
              <span>Partners</span>
            </h2>
          </div>
          <div className="tp__body">
            <p>
              We don't hand over colourful layouts. We give you strategically crafted
              creative solutions that work in favour of your brand — which is why we
              prefer to be called thinking partners, not creative vendors.
            </p>
          </div>
        </section>

        <section className="do reveal">
          <span className="do__label">What We Do</span>
          <div className="do__list">
            <div className="do__item">Creative Works</div>
            <div className="do__item">Printing &amp; Packaging</div>
            <div className="do__item">Event Planning</div>
            <div className="do__item">Digital Marketing Content</div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-team reveal">
          <div className="about-team__head">
            <div>
              <p className="eyebrow">The Thinkers &amp; Makers</p>
              <h2 className="h-hero" style={{ fontSize: "clamp(32px, 4.5vw, 54px)" }}>
                Leadership &amp; Team
              </h2>
            </div>
            <p className="about-team__lead">
              The creative minds and strategic operators dedicated to transforming businesses into indelible cultural identities.
            </p>
          </div>

          <div className="about-team__grid">
            {teamMembers.map((member, idx) => (
              <div
                key={member.name}
                className={`team-card reveal d${(idx % 4) + 1}`}
              >
                <div className="team-card__visual">
                  <span className="team-card__index">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <img
                    src={member.image}
                    alt={`${member.name} — ${member.designation}`}
                    loading="lazy"
                  />
                  <div className="team-card__overlay" aria-hidden="true" />
                </div>
                <div className="team-card__content">
                  <span className="team-card__role">{member.designation}</span>
                  <h3 className="team-card__name">{member.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Footline
          links={[
            { href: "/works", label: "Works" },
            { href: "/contact", label: "Contact" },
          ]}
        />
      </main>
    </ShellLayout>
  );
}
