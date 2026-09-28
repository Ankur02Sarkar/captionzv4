import { useEffect, useRef, useState } from "react";

interface HiResImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  hi?: string | null;
}

export function HiResImage({ src, alt, hi, className, ...rest }: HiResImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    if (!hi) return;

    let isMounted = true;

    const upgrade = () => {
      const probe = new Image();
      probe.referrerPolicy = "no-referrer";
      probe.onload = () => {
        if (!isMounted) return;
        const naturalWidth = imgRef.current?.naturalWidth || 0;
        if (probe.naturalWidth > naturalWidth || naturalWidth === 0) {
          setCurrentSrc(hi);
        }
      };
      probe.src = hi;
    };

    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        idleId = (window as any).requestIdleCallback(upgrade, { timeout: 2500 });
      } else {
        timerId = setTimeout(upgrade, 1200);
      }
    }

    return () => {
      isMounted = false;
      if (idleId && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [src, hi]);

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      data-hi={hi || undefined}
      referrerPolicy="no-referrer"
      loading="lazy"
      className={className}
      {...rest}
    />
  );
}
