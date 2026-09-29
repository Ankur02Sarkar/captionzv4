import fs from "fs";
import crypto from "crypto";

const accountId = "0d2847931bbad9f6b3680d8f9141f50d";
const bucket = "captionz-storage";
const r2BaseUrl = "https://pub-97c17fb137b447f6a52871a6328a8f1a.r2.dev";

// Read wrangler token
const toml = fs.readFileSync("/Users/ankur/Library/Preferences/.wrangler/config/default.toml", "utf8");
const tokenMatch = toml.match(/oauth_token\s*=\s*"([^"]+)"/);
if (!tokenMatch) {
  console.error("No oauth_token found in wrangler config");
  process.exit(1);
}
const token = tokenMatch[1];

async function main() {
  console.log("Reading worksData.ts and casestudies.json...");
  let worksContent = fs.readFileSync("app/data/worksData.ts", "utf8");
  const caseStudiesRaw = JSON.parse(fs.readFileSync("casestudies.json", "utf8"));

  // Extract exact full URLs from within double quotes in worksData
  const matches = [...worksContent.matchAll(/"(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  const allUrls = [...new Set(matches)];
  const targetUrls = allUrls.filter(
    (u) => u.includes("static.wixstatic.com") || u.includes("googleusercontent.com")
  );

  console.log(`Found ${targetUrls.length} image URLs to migrate to R2 bucket "${bucket}"`);

  const urlMap = new Map();

  for (const url of targetUrls) {
    const hash = crypto.createHash("md5").update(url).digest("hex").slice(0, 10);
    let ext = ".jpg";
    if (url.includes(".png")) ext = ".png";
    else if (url.includes(".webp")) ext = ".webp";

    // Clean key name
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1].split("?")[0].replace(/[^a-zA-Z0-9._-]/g, "_");
    const namePart = lastPart.slice(0, 40);
    const key = `works/${hash}_${namePart.endsWith(ext) ? namePart : namePart + ext}`;
    urlMap.set(url, { key, r2Url: `${r2BaseUrl}/${key}` });
  }

  const CONCURRENCY = 10;
  const entries = Array.from(urlMap.entries());
  let completed = 0;
  let failed = 0;

  async function processItem(url, info, retries = 2) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (!res.ok) throw new Error(`Download HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const contentType = res.headers.get("content-type") || "image/jpeg";

      const putRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${info.key}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": contentType,
          },
          body: Buffer.from(arrayBuffer),
        }
      );

      if (!putRes.ok) {
        const errText = await putRes.text();
        throw new Error(`Upload HTTP ${putRes.status}: ${errText}`);
      }

      completed++;
      if (completed % 25 === 0 || completed === entries.length) {
        console.log(`Progress: ${completed}/${entries.length} uploaded (${failed} failed)`);
      }
    } catch (err) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 1000));
        return processItem(url, info, retries - 1);
      }
      failed++;
      console.error(`Failed ${url}:`, err.message);
    }
  }

  console.log(`Starting parallel download & upload (concurrency: ${CONCURRENCY})...`);
  const queue = [...entries];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      await processItem(item[0], item[1]);
    }
  });

  await Promise.all(workers);
  console.log(`Finished image migration! Completed: ${completed}, Failed: ${failed}`);

  // Replace URLs in worksData.ts
  console.log("Replacing URLs in worksData.ts with R2 URLs...");
  for (const [oldUrl, info] of urlMap.entries()) {
    worksContent = worksContent.replaceAll(oldUrl, info.r2Url);
  }
  fs.writeFileSync("app/data/worksData.ts", worksContent, "utf8");
  console.log("app/data/worksData.ts updated!");

  // Parse worksData array dynamically
  const match = worksContent.match(/export const worksData: WorkItem\[\] = (\[[\s\S]*?\]);/);
  if (!match) throw new Error("Could not parse worksData array from worksData.ts");
  const worksData = eval(match[1]);

  // Generate seed.sql
  console.log("Generating scripts/seed.sql...");
  let sql = "-- Seed Captionz Database\n\n";
  sql += "DELETE FROM case_studies;\n";
  sql += "DELETE FROM works;\n\n";

  function esc(val) {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "boolean") return val ? 1 : 0;
    if (typeof val === "number") return val;
    return "'" + String(val).replace(/'/g, "''") + "'";
  }

  function escJson(val) {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "string") {
      return "'" + val.replace(/'/g, "''") + "'";
    }
    return "'" + JSON.stringify(val).replace(/'/g, "''") + "'";
  }

  // Insert case studies
  for (const cs of caseStudiesRaw) {
    sql += `INSERT INTO case_studies (
      id, slug, client, title, industry, category, year, tagline, hero_image,
      gallery_images, overview, challenge, strategy, results, testimonial,
      deliverables, external_url, published, created_at, updated_at
    ) VALUES (
      ${esc(cs.id)}, ${esc(cs.slug)}, ${esc(cs.client)}, ${esc(cs.title)},
      ${esc(cs.industry)}, ${esc(cs.category)}, ${esc(cs.year)}, ${esc(cs.tagline)},
      ${esc(cs.heroImage)}, ${escJson(cs.galleryImages)}, ${esc(cs.overview)},
      ${esc(cs.challenge)}, ${esc(cs.strategy)}, ${escJson(cs.results)},
      ${escJson(cs.testimonial)}, ${escJson(cs.deliverables)}, ${escJson(cs.externalUrl)},
      ${esc(cs.published)}, ${esc(cs.createdAt)}, ${esc(cs.updatedAt)}
    );\n`;
  }

  // Insert works
  for (const w of worksData) {
    sql += `INSERT INTO works (
      slug, num, name, title, meta_description, sector, eyebrow, category,
      tag, is_photo, thumb, tint, intro, is_case_study, brand_logo, cover_image,
      quote, notes, color_pillars, lede_paragraphs, gallery, next_link, back_link
    ) VALUES (
      ${esc(w.slug)}, ${esc(w.num)}, ${esc(w.name)}, ${esc(w.title)},
      ${esc(w.metaDescription)}, ${esc(w.sector)}, ${esc(w.eyebrow)}, ${esc(w.category)},
      ${esc(w.tag)}, ${esc(w.isPhoto)}, ${esc(w.thumb)}, ${esc(w.tint)},
      ${esc(w.intro)}, ${esc(w.isCaseStudy)}, ${esc(w.brandLogo)}, ${escJson(w.coverImage)},
      ${escJson(w.quote)}, ${escJson(w.notes)}, ${escJson(w.colorPillars)},
      ${escJson(w.ledeParagraphs)}, ${escJson(w.gallery)}, ${escJson(w.nextLink)},
      ${escJson(w.backLink)}
    );\n`;
  }

  fs.writeFileSync("scripts/seed.sql", sql, "utf8");
  console.log("Successfully generated scripts/seed.sql with 9 case studies and 10 works!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
