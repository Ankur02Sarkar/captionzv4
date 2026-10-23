import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { PageFlip, PageFlipCorner } from "page-flip";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";

type DeckStatus = "idle" | "loading" | "rendering" | "ready" | "error";

interface CaseStudyFlipbookProps {
  /** Same-origin proxy URL for the PDF. */
  src: string;
  client: string;
  title: string;
  /** Public PDF URL, used for the reading fallback. */
  openHref?: string | null;
}

/** PDF pages are 960x540pt, so 2x gives a crisp 1920x1080 raster. */
const PAGE_RENDER_SCALE = 2;

function pageImageFromCanvas(canvas: HTMLCanvasElement): string {
  const webp = canvas.toDataURL("image/webp", 0.94);
  if (webp.startsWith("data:image/webp")) return webp;
  return canvas.toDataURL("image/png");
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

function friendlyError(error: unknown): string {
  if (error && typeof error === "object" && "name" in error) {
    const name = String((error as { name?: unknown }).name);
    if (name === "InvalidPDFException") {
      return "The file was found, but it could not be read as a PDF.";
    }
    if (name === "MissingPDFException") {
      return "The PDF is not available at the moment.";
    }
  }
  return "The deck could not be prepared. The full PDF is still available.";
}

function padPage(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * page-flip 2.0.7 probes the previous corner at x=10, but the portrait book's
 * coordinate origin sits one page to the left. With click-to-flip disabled,
 * that makes every programmatic flipPrev() silently fail, including the
 * library's own previous-page swipe. Relax the guard for the synchronous call
 * only so previous flips (buttons, keyboard, and touch) all animate.
 */
function protectPreviousFlip(flip: PageFlip): void {
  const flipPrev = flip.flipPrev.bind(flip);

  flip.flipPrev = (corner?: PageFlipCorner) => {
    const settings = flip.getSettings();
    const disableFlipByClick = settings.disableFlipByClick;
    if (!disableFlipByClick) {
      flipPrev(corner);
      return;
    }

    settings.disableFlipByClick = false;
    try {
      flipPrev(corner);
    } finally {
      settings.disableFlipByClick = disableFlipByClick;
    }
  };
}

/**
 * The case study deck as a single-page page-curl flipbook.
 *
 * PDF.js rasterises each page to an image first. PageFlip clones page nodes
 * while curling, and cloned canvases do not reliably carry their bitmap, so
 * images are the safer substrate. PageFlip also owns its own DOM: it is built
 * imperatively inside a stable, childless React host to keep the two
 * reconcilers out of each other's way.
 */
export function CaseStudyFlipbook({
  src,
  client,
  title,
  openHref,
}: CaseStudyFlipbookProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bookHostRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);

  const [status, setStatus] = useState<DeckStatus>("idle");
  const [pages, setPages] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);

  const ready = status === "ready" && isMounted;
  const overlayVisible = status !== "ready" || !isMounted;
  const canGoPrev = ready && pageIndex > 0 && !isFlipping;
  const canGoNext = ready && pageIndex < pages.length - 1 && !isFlipping;
  const visualProgress =
    status === "ready" && pageCount > 0
      ? (pageIndex + 1) / pageCount
      : progress;
  const pageLabel =
    pageCount > 0
      ? `${padPage(pageIndex + 1)} / ${padPage(pageCount)}`
      : "00 / 00";

  // Respect the OS motion preference: the page still turns, but instantly.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Load lazily when the deck approaches the viewport. The PDF is a proxy
  // route, so PDF.js never has to deal with third-party CORS headers.
  useEffect(() => {
    if (!src) {
      setStatus("error");
      setError("No deck is attached to this case study yet.");
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    let cancelled = false;
    let started = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;

    const load = async () => {
      if (cancelled) return;
      setStatus("loading");
      setPages([]);
      setPageIndex(0);
      setPageCount(0);
      setProgress(0);
      setError("");
      setHasFlipped(false);

      try {
        const [pdfjs, worker] = await Promise.all([
          import("pdfjs-dist"),
          import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
        ]);
        if (cancelled) return;

        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

        loadingTask = pdfjs.getDocument({
          url: src,
          withCredentials: false,
        });
        const document = await loadingTask.promise;
        if (cancelled) return;

        const total = document.numPages;
        setPageCount(total);
        setStatus("rendering");

        const images: string[] = [];

        for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
          if (cancelled) return;

          const page = await document.getPage(pageNumber);
          const viewport = page.getViewport({ scale: PAGE_RENDER_SCALE });
          const canvas = window.document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);

          await page.render({ canvas, viewport }).promise;
          images.push(pageImageFromCanvas(canvas));
          page.cleanup();

          if (!cancelled) setProgress(pageNumber / total);
        }

        if (cancelled) return;

        // Decode the images before PageFlip starts cloning them; otherwise the
        // first curl can catch a half-decoded page.
        await Promise.all(images.map(preloadImage));
        if (cancelled) return;

        setPages(images);
        setStatus("ready");
      } catch (loadError) {
        if (cancelled) return;
        console.error("Case study deck failed to load:", loadError);
        setError(friendlyError(loadError));
        setStatus("error");
      }
    };

    const start = () => {
      if (started) return;
      started = true;
      observer?.disconnect();
      void load();
    };

    let observer: IntersectionObserver | null = null;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) start();
        },
        { rootMargin: "300px 0px" }
      );
      observer.observe(section);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (loadingTask) {
        void loadingTask.destroy().catch(() => {});
      }
    };
  }, [src, retryToken]);

  // Build PageFlip only after the page images exist. The host itself stays
  // empty from React's point of view, so later state changes (page number,
  // flipping state) can never reparent the library's page nodes.
  useEffect(() => {
    if (status !== "ready" || pages.length === 0) return;

    const host = bookHostRef.current;
    if (!host) return;

    let cancelled = false;
    let instance: PageFlip | null = null;

    setIsMounted(false);
    setIsFlipping(false);
    setHasFlipped(false);

    const build = async () => {
      try {
        const { PageFlip: PageFlipClass } = await import("page-flip");
        if (cancelled) return;

        host.replaceChildren();

        const book = document.createElement("div");
        book.className = "cs-flip__book";
        host.appendChild(book);

        pages.forEach((pageSrc, index) => {
          const page = document.createElement("div");
          page.className = "cs-flip__page";
          page.dataset.density =
            index === 0 || index === pages.length - 1 ? "hard" : "soft";

          const image = document.createElement("img");
          image.src = pageSrc;
          image.alt = `${title} — page ${index + 1}`;
          image.draggable = false;

          page.appendChild(image);
          book.appendChild(page);
        });

        const elements = Array.from(
          book.querySelectorAll<HTMLElement>(".cs-flip__page")
        );

        instance = new PageFlipClass(book, {
          startPage: 0,
          size: "stretch",
          width: 1280,
          height: 720,
          // The threshold (2 x minWidth) keeps PageFlip in portrait mode for
          // the whole content column, so a 16:9 PDF is read one page at a time.
          minWidth: 800,
          maxWidth: 1280,
          minHeight: 200,
          maxHeight: 720,
          drawShadow: true,
          flippingTime: reducedMotion ? 1 : 850,
          usePortrait: true,
          startZIndex: 1,
          autoSize: true,
          maxShadowOpacity: 0.58,
          showCover: true,
          mobileScrollSupport: true,
          swipeDistance: 30,
          clickEventForward: false,
          useMouseEvents: true,
          showPageCorners: true,
          disableFlipByClick: true,
        });

        protectPreviousFlip(instance);

        instance.on("init", (event) => {
          const data = event.data;
          if (typeof data === "object" && data !== null) {
            const page = (data as { page?: unknown }).page;
            if (typeof page === "number") setPageIndex(page);
          }
          setIsFlipping(false);
          setIsMounted(true);
        });

        instance.on("flip", (event) => {
          if (typeof event.data === "number") {
            setPageIndex(event.data);
            setHasFlipped(true);
          }
        });

        instance.on("changeState", (event) => {
          setIsFlipping(event.data === "flipping");
        });

        flipRef.current = instance;
        instance.loadFromHTML(elements);
      } catch (buildError) {
        if (cancelled) return;
        console.error("Case study flipbook failed to initialise:", buildError);
        setError("The flipbook could not be prepared. The full PDF is still available.");
        setStatus("error");
      }
    };

    void build();

    return () => {
      cancelled = true;
      const flip = instance ?? flipRef.current;
      flipRef.current = null;
      if (flip) {
        try {
          flip.destroy();
        } catch {
          // The library can leave a partial UI behind if setup failed.
        }
      }
      host.replaceChildren();
    };
  }, [status, pages, title, reducedMotion]);

  const step = useCallback(
    (direction: -1 | 1) => {
      if (!ready || isFlipping) return;
      const flip = flipRef.current;
      if (!flip) return;

      if (direction === 1) {
        if (pageIndex >= pages.length - 1) return;
        flip.flipNext("bottom");
      } else {
        if (pageIndex <= 0) return;
        flip.flipPrev("bottom");
      }
      setHasFlipped(true);
    },
    [isFlipping, pageIndex, pages.length, ready]
  );

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!ready) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      if (pageIndex !== 0) {
        flipRef.current?.turnToPage(0);
        setPageIndex(0);
        setHasFlipped(true);
      }
    } else if (event.key === "End") {
      event.preventDefault();
      const last = pages.length - 1;
      if (last >= 0 && pageIndex !== last) {
        flipRef.current?.turnToPage(last);
        setPageIndex(last);
        setHasFlipped(true);
      }
    }
  };

  const onStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!ready) return;
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;
    event.currentTarget.focus({ preventScroll: true });
  };

  const retry = () => {
    setError("");
    setStatus("idle");
    setRetryToken((value) => value + 1);
  };

  const overlayKicker =
    status === "error"
      ? "Deck unavailable"
      : status === "rendering"
        ? "Binding the pages"
        : status === "ready"
          ? "Finishing the binding"
          : "Preparing the deck";

  const overlayTitle =
    status === "error"
      ? "The pages wouldn’t open."
      : status === "rendering"
        ? `Laying out page ${Math.max(1, Math.ceil(progress * pageCount))} of ${pageCount}.`
        : "The full case study, page by page.";

  const overlayNote =
    status === "error"
      ? error
      : status === "rendering"
        ? "Rendering the deck at full resolution so every page stays sharp."
        : "A moment while the deck is fetched and the paper is prepared.";

  return (
    <section
      ref={sectionRef}
      className={`cs-flip${ready ? " is-ready" : ""}`}
      aria-label={`${client} case study flipbook`}
      aria-busy={overlayVisible}
    >
      <div className="cs-flip__mast">
        <div className="cs-flip__brand">
          <span className="cs-flip__mark" aria-hidden="true">
            C
          </span>
          <span>
            <span className="cs-flip__eyebrow">Case Study Deck</span>
            <span className="cs-flip__name">
              {client} <span aria-hidden="true">/</span> {title}
            </span>
          </span>
        </div>

        <div className="cs-flip__mast-right">
          <span className="cs-flip__format">16:9 PDF</span>
          {openHref && (
            <a
              className="cs-flip__open"
              href={openHref}
              target="_blank"
              rel="noopener noreferrer"
              data-no-gate
            >
              Open PDF
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
        </div>
      </div>

      <div
        className="cs-flip__stage"
        onKeyDown={onKeyDown}
        onPointerDown={onStagePointerDown}
        tabIndex={ready ? 0 : -1}
        role="group"
        aria-roledescription="flipbook"
        aria-label="Case study pages. Use the left and right arrow keys to turn pages."
      >
        <span className="cs-flip__arch" aria-hidden="true" />
        <div ref={bookHostRef} className="cs-flip__book-host" />

        {overlayVisible && (
          <div
            className="cs-flip__overlay"
            role={status === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {status === "error" ? (
              <div className="cs-flip__overlay-inner">
                <span className="cs-flip__overlay-kicker">{overlayKicker}</span>
                <p className="cs-flip__overlay-title">{overlayTitle}</p>
                <p className="cs-flip__overlay-note">{overlayNote}</p>
                <div className="cs-flip__overlay-actions">
                  <button type="button" className="cs-flip__retry" onClick={retry}>
                    Try again
                  </button>
                  {openHref && (
                    <a
                      className="cs-flip__overlay-link"
                      href={openHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-no-gate
                    >
                      Open the PDF
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="cs-flip__overlay-inner">
                <span className="cs-flip__spinner" aria-hidden="true" />
                <span className="cs-flip__overlay-kicker">{overlayKicker}</span>
                <p className="cs-flip__overlay-title">{overlayTitle}</p>
                <p className="cs-flip__overlay-note">{overlayNote}</p>
                <div className="cs-flip__loadbar" aria-hidden="true">
                  <span style={{ width: `${Math.round(visualProgress * 100)}%` }} />
                </div>
                <span className="cs-flip__percent">
                  {Math.round(visualProgress * 100)}%
                </span>
              </div>
            )}
          </div>
        )}

        {ready && !hasFlipped && (
          <span className="cs-flip__corner-hint" aria-hidden="true">
            Drag a corner
          </span>
        )}
      </div>

      <div className="cs-flip__bar">
        <div className="cs-flip__nav">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={!canGoPrev}
            aria-label="Previous page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={!canGoNext}
            aria-label="Next page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="cs-flip__progress-wrap">
          <div className="cs-flip__progress" aria-hidden="true">
            <span style={{ width: `${Math.round(visualProgress * 100)}%` }} />
          </div>
          <span className="cs-flip__hint">
            {status === "error"
              ? "Use the PDF button above to read the deck."
              : ready
                ? "Drag a page corner, swipe, or use the arrow keys."
                : "Preparing the case study deck."}
          </span>
        </div>

        <span className="cs-flip__count" aria-live="polite" aria-atomic="true">
          <span>{pageLabel.split(" / ")[0]}</span>
          <span aria-hidden="true"> / </span>
          <span>{pageLabel.split(" / ")[1]}</span>
        </span>
      </div>
    </section>
  );
}
