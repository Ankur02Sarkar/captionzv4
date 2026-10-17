-- ============================================================================
-- Case Study refresh — GOFIN / Minitech / La Belle from the new 2026 decks,
-- real imagery for Bradsol & Little Buddy, typographic plates for the rest.
-- Generated for captionz-db. Apply with:
--   npx wrangler d1 execute captionz-db --remote --file scripts/update-case-studies-2026.sql
-- ============================================================================

UPDATE case_studies SET
  tagline = 'Relax. We handle the process while you focus on your dream home.',
  hero_image = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/hero.jpg',
  client_logo = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/logos/gofin.png',
  overview = 'GOFIN is a loan advisory and disbursement company founded by Ramakrishna (“Ramki”), an industry professional with over a decade of experience. The business goal was simple to state and hard to earn: create a brand that carries the same trust as its founder.',
  challenge = 'People trusted Ramki. People didn’t know GOFIN. Loan seekers were confused, documentation looked intimidating, multiple lenders created uncertainty and everyone claimed to offer the best rate. The question we had to answer: how do we make loans feel simple and stress-free?',
  strategy = 'People don’t fear loans. They fear making the wrong loan decision. So instead of selling loans, we sold confidence. We designed an identity that mirrors the customer’s journey — blue, where dreams begin; red, the anxiety of decisions; green, guidance, trust and fulfilment — with a deliberate white space at the centre representing the customer’s dream, completed through GOFIN’s guidance. A three-year roadmap followed: trust, then recall, then personality.',
  results = '[{"value": "3-Year", "label": "Roadmap: Trust → Recall → Personality"}, {"value": "3 Stage", "label": "Logo mapped to the customer journey"}, {"value": "2 Audiences", "label": "Borrowers and banking leadership"}, {"value": "Founder → Brand", "label": "From a founder-led business to a recognised brand"}]',
  deliverables = '["Brand Strategy & Positioning", "Logo Architecture (3-Stage Identity)", "3-Year Campaign Roadmap", "Festival & Occasion Campaigns", "Outdoor & Hoarding Campaigns", "Experience Design at Banking Forums"]',
  gallery_images = '["https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/01-founder.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/02-journey.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/03-pillars.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/04-paperless-loans.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/05-loan-lanes.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/06-money-tunnel.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/07-valentine.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/08-ganapati.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/09-diwali.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/10-hoardings.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/11-experience-stall.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin/gallery/12-standee.jpg"]',
  external_url = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/gofin-case-study.pdf',
  updated_at = datetime('now')
WHERE slug = 'gofin-home-loans';

UPDATE case_studies SET
  title = 'From Local Player to Brand Leader',
  tagline = 'Owning the conversation around flooring — without constantly showing floors.',
  hero_image = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/hero.jpg',
  client_logo = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/logos/minitech.png',
  overview = 'MINITECH had exceptional technical expertise. The market simply wasn’t noticing it. Captionz was brought in to take a twenty-year-old, well-known name and reposition it as the leader of its category.',
  challenge = 'Before Captionz, Minitech competed on specifications and price. Younger decision makers entering the industry were reading an ageing identity, and the engineering ambition behind the product was invisible. Industrial flooring was being treated as a commodity purchase — the opposite of what it actually was.',
  strategy = 'We made one strategic decision: own the conversation around flooring without constantly showing floors. That meant a contemporary identity for a new generation of decision makers, a four-year communication platform, and campaign systems — print, social, festival, stall design and brochures — that sold confidence instead of square metres.',
  results = '[{"value": "Recognised", "label": "“They recognised MINITECH, not me.” — the founder"}, {"value": "4-Year", "label": "Communication platform built to own the category"}, {"value": "Younger", "label": "Decision makers brought back into the brand"}, {"value": "Category", "label": "Flooring conversation owned without showing floors"}]',
  testimonial = '{"quote": "They did not recognise me first. They recognised MINITECH. That was the day I realised we had become a brand.", "title": "Founder, Minitech Floorings", "author": "Prem Nath Mammidi"}',
  deliverables = '["Brand Evolution & Identity System", "4-Year Communication Platform", "Stall & Experience Design", "Print Advertising Campaigns", "Brochure & Proposal Systems", "Social & Festival Campaigns"]',
  gallery_images = '["https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/01-roadmap.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/02-facility.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/03-mall-flooring.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/04-concrete-platform.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/05-april-fools.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/06-impact-system.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/07-experience-stall.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/08-brochure.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/09-print-joints.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/10-print-precision.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/11-print-heart-of-flooring.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech/gallery/12-capabilities.jpg"]',
  external_url = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/minitech-case-study-2026.pdf',
  updated_at = datetime('now')
WHERE slug = 'minitech-industrial-floors';

UPDATE case_studies SET
  title = 'The La Belle Evolution: From Advertising to Experience',
  tagline = 'Fifteen years, one partnership, still evolving.',
  hero_image = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle/hero.jpg',
  client_logo = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/logos/labelle.png',
  overview = 'La Belle Skin · Hair · Slimming had been advertising for years — and it was working. Visibility was translating to response across English, Hindi, Telugu and Urdu media. The problem had simply moved somewhere advertising couldn’t reach.',
  challenge = 'One message was landing in a fragmented landscape. Four audiences were hearing different things. And behind the response, the clinic reality was leaking: phones going unanswered, overcrowded reception spaces, unprofessional customer handling, an environment below expectations. The issue wasn’t awareness — the issue was experience.',
  strategy = 'So we stopped looking at the advertising and started looking at what happened after the phone rang. We built a complete brand ecosystem across Identity, Space, Service and Communication — inclusive premises, wellness content, utility media and integrated communication — then evolved the footprint beyond Hyderabad into Chennai, Bengaluru and Vijayawada as the market changed.',
  results = '[{"value": "15 Years", "label": "One partnership, still evolving"}, {"value": "4 Cities", "label": "Hyderabad → Chennai → Bengaluru → Vijayawada"}, {"value": "4 Audiences", "label": "One brand across four language markets"}, {"value": "Ecosystem", "label": "Identity · Space · Service · Communication"}]',
  deliverables = '["Brand Ecosystem Architecture", "Identity System", "Space & Reception Experience", "Service & Customer Journey", "Multi-language Communication", "Regional Footprint Expansion"]',
  gallery_images = '["https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle/gallery/01-advertising-was-working.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle/gallery/02-but-the-business-wasnt.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle/gallery/03-one-message.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle/gallery/04-four-audiences.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle/gallery/05-visibility-to-response.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle/gallery/06-clinic-reality.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle/gallery/07-brand-ecosystem.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle/gallery/08-evolving-footprint.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle/gallery/09-market-changed.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle/gallery/10-partnership.jpg"]',
  external_url = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/la-belle-evolution.pdf',
  updated_at = datetime('now')
WHERE slug = 'labelle-body-care';

UPDATE case_studies SET
  hero_image = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/fb10b704ec_d76625_5e755dec80754bd6ab38d88100c5c232_.jpg',
  client_logo = NULL,
  gallery_images = '["https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/fb10b704ec_d76625_5e755dec80754bd6ab38d88100c5c232_.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/0fe0193ee3_d76625_965e26575bbb4155b85743c88ea0e678_.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/0e8de603d7_d76625_75cd597547d741f89716f9c7ad5b9c3d_.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/005f176dd3_d76625_e12232e32fee40c9b772b08053aa41f3_.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/ee909f58cf_d76625_144d14fead04439e972ca9eb661a4411_.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/a8cf8850ec_d76625_70bf769906cd4b05a2ae6cbd75bc509d_.jpg"]',
  updated_at = datetime('now')
WHERE slug = 'bradsol-rebrand';

UPDATE case_studies SET
  hero_image = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/6a9500aa76_d76625_8a616000770e4cd8ac6e80101fee834b_.jpg',
  client_logo = NULL,
  gallery_images = '["https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/6a9500aa76_d76625_8a616000770e4cd8ac6e80101fee834b_.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/f2586852b5_d76625_41710735137044888fd9da7a8949f25f_.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/4e52015ebc_d76625_83f6a29367bb4126ab46c35307483bf1_.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/ee1eab8fba_d76625_3fb917f8ab354341bd6d4acf66ba20e3_.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/1a7d4b7abe_d76625_674547b444fa4c82ae072ea6b28214c3_.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/483db05129_d76625_26baff0a64844af78b4796470ea3d167_.jpg", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/3f4293f1e3_d76625_4cd0f0a8a0904d83af9e8549f84f8e6d_.png", "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/works/2cae011868_d76625_67672d634b834a07a7ac41b832bdc59a_.png"]',
  updated_at = datetime('now')
WHERE slug = 'little-buddy-branding';

UPDATE case_studies SET
  hero_image = '',
  client_logo = NULL,
  gallery_images = '[]',
  updated_at = datetime('now')
WHERE slug = 'caroman-social-campaigns';

UPDATE case_studies SET
  hero_image = '',
  client_logo = NULL,
  gallery_images = '[]',
  updated_at = datetime('now')
WHERE slug = 'credible-insurance-rebellion';

UPDATE case_studies SET
  hero_image = '',
  client_logo = NULL,
  gallery_images = '[]',
  updated_at = datetime('now')
WHERE slug = 'libr-minimal-mark';

UPDATE case_studies SET
  hero_image = '',
  client_logo = NULL,
  gallery_images = '[]',
  updated_at = datetime('now')
WHERE slug = 'mlrit-brand-architecture';

-- Repoint works brand logos at R2 and drop the public-folder copies
UPDATE works SET brand_logo = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/logos/gofin.png', thumb = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/logos/gofin.png' WHERE slug = 'gofin';
UPDATE works SET brand_logo = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/logos/minitech.png', thumb = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/logos/minitech.png' WHERE slug = 'minitech';
UPDATE works SET brand_logo = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/logos/labelle.png', thumb = 'https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev/case-studies/logos/labelle.png' WHERE slug = 'la-belle';
