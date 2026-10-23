import type { Route } from "./+types/case-study-deck-pdf";
import { eq } from "drizzle-orm";
import { getDatabase } from "../db/getDb";
import { caseStudies } from "../db/schema";

/**
 * Same-origin proxy for the public case study PDFs.
 *
 * The R2 public bucket serves the PDFs without CORS headers, which prevents
 * PDF.js from reading them cross-origin. This resource route looks the URL up
 * in D1 (so it cannot be used as an open proxy), streams the PDF back, and
 * preserves range requests so the viewer can seek if it needs to.
 */
export async function loader({ params, request, context }: Route.LoaderArgs) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  const slug = params.slug;
  if (!slug) {
    throw new Response("Case Study Not Found", { status: 404 });
  }

  const db = getDatabase(context);
  if (!db) {
    throw new Response("Deck Unavailable", { status: 503 });
  }

  const rows = await db
    .select({ externalUrl: caseStudies.externalUrl })
    .from(caseStudies)
    .where(eq(caseStudies.slug, slug))
    .limit(1);

  const externalUrl = rows[0]?.externalUrl;
  if (!externalUrl) {
    throw new Response("Deck Not Found", { status: 404 });
  }

  let pdfUrl: URL;
  try {
    pdfUrl = new URL(externalUrl);
    if (pdfUrl.protocol !== "https:") throw new Error("Unsupported protocol");
  } catch {
    throw new Response("Deck Not Found", { status: 404 });
  }

  let upstream: Response;
  try {
    const range = request.headers.get("range");
    upstream = await fetch(pdfUrl, {
      method: request.method,
      headers: range ? { Range: range } : undefined,
    });
  } catch {
    throw new Response("Deck Unavailable", { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    throw new Response(
      upstream.status === 404 ? "Deck Not Found" : "Deck Unavailable",
      { status: upstream.status === 404 ? 404 : 502 }
    );
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${slug}.pdf"`);
  headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  headers.set("Accept-Ranges", upstream.headers.get("accept-ranges") || "bytes");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Robots-Tag", "noindex");

  for (const name of ["content-length", "content-range", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}
