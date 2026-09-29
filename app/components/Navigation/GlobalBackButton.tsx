import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export function GlobalBackButton() {
  const [canGoBack, setCanGoBack] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const updateCanGoBack = () => {
      if (typeof window === "undefined") return;

      const state = window.history.state as { idx?: number } | null;
      if (state && typeof state.idx === "number") {
        setCanGoBack(state.idx > 0);
      } else {
        setCanGoBack(window.history.length > 1);
      }
    };

    updateCanGoBack();

    window.addEventListener("popstate", updateCanGoBack);
    return () => window.removeEventListener("popstate", updateCanGoBack);
  }, [location]);

  if (!canGoBack) {
    return null;
  }

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.history.back();
  };

  return (
    <button
      type="button"
      className="global-back-btn"
      onClick={handleBack}
      aria-label="Go back to previous page"
    >
      <span className="global-back-btn__icon" aria-hidden="true">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </span>
      <span className="global-back-btn__label">Back</span>
    </button>
  );
}
