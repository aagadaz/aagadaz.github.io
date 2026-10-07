import type { Metadata, Viewport } from "next";
// Polices auto-hébergées via npm (@fontsource) : les fichiers .woff2 sont
// copiés dans le build et servis depuis TON domaine. Aucune requête vers
// Google, ni au build ni au runtime (RGPD + build reproductible hors-ligne).
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import { profile } from "@/data/profile";
import "./globals.css";

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.title}`,
  description: profile.tagline,
  openGraph: { title: `${profile.name} — ${profile.title}`, description: profile.tagline, type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0e" },
  ],
};

/**
 * Script bloquant exécuté AVANT le premier rendu du navigateur.
 * Il lit le thème mémorisé (ou la préférence système) et pose
 * data-theme sur <html>. Sans lui, la page s'afficherait en clair
 * puis "flasherait" en sombre après l'hydratation React.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning : data-theme est posé par le script avant React,
    // donc le HTML serveur et le DOM client diffèrent volontairement sur cet attribut.
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
