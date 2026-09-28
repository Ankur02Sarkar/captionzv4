import { useState } from "react";
import type { Route } from "./+types/contact";
import { ShellLayout } from "../components/Layout/ShellLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact — Captionz" },
    {
      name: "description",
      content:
        "Have a project in mind? Get in touch with Captionz — Gateway of Branding.",
    },
  ];
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [errors, setErrors] = useState<{
    name?: boolean;
    email?: boolean;
    message?: boolean;
  }>({});

  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: boolean; email?: boolean; message?: boolean } = {};
    let hasError = false;

    if (!formData.name.trim()) {
      newErrors.name = true;
      hasError = true;
    }
    if (!validateEmail(formData.email.trim())) {
      newErrors.email = true;
      hasError = true;
    }
    if (!formData.message.trim()) {
      newErrors.message = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      setIsSubmitted(false);
      return;
    }

    setIsSubmitted(true);
    setFormData({ name: "", email: "", company: "", message: "" });
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <ShellLayout activeSection="contact">
      <div className="contact-wrap">
        <main className="contact-col main" style={{ paddingLeft: 0 }}>
          <p className="eyebrow reveal">Let's Connect</p>
          <h1
            className="h-hero reveal d1"
            style={{ fontSize: "clamp(38px, 5.6vw, 64px)" }}
          >
            Let's build
            <br />
            what matters
            <span style={{ color: "var(--red)" }}>.</span>
          </h1>
          <p className="lede reveal d2">
            Have a project in mind? We'd love to hear about it.
          </p>

          <form
            className="reveal d3"
            id="contactForm"
            style={{ marginTop: "40px", maxWidth: "560px" }}
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="field-row">
              <div className={`field ${errors.name ? "has-error" : ""}`}>
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: false });
                  }}
                />
                <div className="field__err">Please tell us your name.</div>
              </div>
              <div className={`field ${errors.email ? "has-error" : ""}`}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: false });
                  }}
                />
                <div className="field__err">Please enter a valid email.</div>
              </div>
            </div>

            <div className="field">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                placeholder="Enter your company"
                autoComplete="organization"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>

            <div className={`field ${errors.message ? "has-error" : ""}`}>
              <label htmlFor="message">Tell us about your project</label>
              <textarea
                id="message"
                name="message"
                rows={1}
                placeholder="Share a few details…"
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  if (errors.message) setErrors({ ...errors, message: false });
                }}
              />
              <div className="field__err">
                Share a few details so we know where to start.
              </div>
            </div>

            <div className="submit-row">
              <button type="submit">
                Send Message
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span className={`submit-note ${isSubmitted ? "is-visible" : ""}`}>
                Thank you — we'll be in touch shortly.
              </span>
            </div>
          </form>

          <div className="contact-details reveal d4">
            <div className="contact-details__item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 8l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              <a href="mailto:capt@captionz.biz">capt@captionz.biz</a>
            </div>
            <div className="contact-details__item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 2 .7 3a2 2 0 01-.4 2.1L8 10.3a16 16 0 006 6l1.5-1.5a2 2 0 012.1-.4c1 .4 2 .6 3 .7a2 2 0 011.7 2z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              <a href="tel:+919849818165">+91 98498 18165</a>
            </div>
            <div className="contact-details__item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21s7-6.6 7-11.5A7 7 0 105 9.5C5 14.4 12 21 12 21z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              <span>
                Captionz, 301/301A, Suryakiran Complex,
                <br />
                SD Road, Sec-bad, Hyderabad – 500003
              </span>
            </div>
          </div>

          <footer className="footline" style={{ marginTop: "20px" }}>
            <span>&copy; {currentYear} Captionz. All rights reserved.</span>
          </footer>
        </main>

        <div className="contact-frame reveal d2">
          <img
            src="/assets/contact_gateway_room.jpg"
            alt="A sunlit marble hall with the red Captionz gateway standing at the top of a short flight of steps, beside a small potted tree."
          />
        </div>
      </div>
    </ShellLayout>
  );
}
