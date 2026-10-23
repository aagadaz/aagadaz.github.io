import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { projects, type Project } from "@/data/profile";

/**
 * Études de cas : un fichier Markdown par projet dans content/projets/<slug>.md.
 * Ce module utilise `fs`, donc il n'est importable que depuis du code SERVEUR
 * (Server Components, generateStaticParams). Avec `output: "export"`, tout est
 * lu une seule fois au build : aucun accès disque à l'exécution.
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "projets");

function contentPath(slug: string) {
  return path.join(CONTENT_DIR, `${slug}.md`);
}

/** Slugs des projets qui ont une page détaillée (le fichier Markdown existe). */
export function caseStudySlugs(): string[] {
  return projects.map((p) => p.slug).filter((slug) => fs.existsSync(contentPath(slug)));
}

export interface CaseStudy {
  project: Project;
  html: string;
}

/** Charge et convertit l'étude de cas d'un projet. `null` si elle n'existe pas. */
export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  const project = projects.find((p) => p.slug === slug);
  if (!project || !fs.existsSync(contentPath(slug))) return null;

  const markdown = fs.readFileSync(contentPath(slug), "utf8");
  // Contenu écrit par nous, dans le dépôt : pas d'assainissement nécessaire.
  const html = await marked.parse(markdown, { gfm: true });
  return { project, html };
}
