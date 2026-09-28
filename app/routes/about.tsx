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
