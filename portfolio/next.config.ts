import type { NextConfig } from "next";

/**
 * Export 100 % statique : `next build` produit un dossier `out/`
 * composé uniquement de HTML/CSS/JS. Déployable tel quel sur Vercel,
 * GitHub Pages, Netlify, un bucket S3… sans serveur Node.
 *
 * Pour GitHub Pages sur un dépôt "projet" (ex. github.com/afzal/portfolio),
 * définis NEXT_PUBLIC_BASE_PATH=/portfolio au build.
 * Pour un dépôt "utilisateur" (afzal.github.io) ou Vercel : laisse vide.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true }, // l'optimiseur d'images exige un serveur
  trailingSlash: true,
};

export default nextConfig;
