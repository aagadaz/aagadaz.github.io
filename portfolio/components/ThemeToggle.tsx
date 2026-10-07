"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  // null tant qu'on n'est pas monté côté client : le serveur ne connaît pas le thème.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Le script inline de layout.tsx a déjà posé data-theme : on s'y synchronise.
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* navigation privée : on ignore, le thème reste valable pour la session */
    }
    setTheme(next);
  }

  const label = theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre";

  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={label} title={label}>
      {/* Les deux icônes sont rendues ; le CSS affiche la bonne selon data-theme.
          Ainsi le bon pictogramme est visible dès le 1er paint, avant même l'hydratation. */}
      <svg className="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg className="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
