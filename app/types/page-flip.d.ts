/**
 * Minimal declarations for `page-flip` (StPageFlip 2.0.7).
 *
 * The package ships no type definitions. Only the surface used by the case
 * study flipbook is declared here so the viewer can stay fully typed.
 */
declare module "page-flip" {
  export type PageFlipCorner = "top" | "bottom";

  export type PageFlipOrientation = "portrait" | "landscape";

  export interface PageFlipSettings {
    /** Page number from which to start viewing. */
    startPage?: number;
    /** `fixed` uses width/height; `stretch` follows the parent element. */
    size?: "fixed" | "stretch";
    width?: number;
    height?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export interface PageFlipEvent {
    /** Event payload; `init` is `{ page, mode }`, `flip` is a page number. */
    data: number | string | boolean | Record<string, unknown>;
    object: PageFlip;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings?: PageFlipSettings);

    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    destroy(): void;

    on(eventName: string, callback: (event: PageFlipEvent) => void): this;
    off(eventName: string): void;

    getSettings(): PageFlipSettings;

    flipNext(corner?: PageFlipCorner): void;
    flipPrev(corner?: PageFlipCorner): void;
    turnToPage(page: number): void;
    turnToNextPage(): void;
    turnToPrevPage(): void;

    update(): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): PageFlipOrientation;
  }
}
