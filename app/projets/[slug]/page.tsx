import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { profile } from "@/data/profile";
import { caseStudySlugs, getCaseStudy } from "@/lib/case-studies";

type Params = { slug: string };

/**
 * Route dynamique + export statique : Next.js doit connaître AU BUILD la liste
 * des pages à générer. generateStaticParams la fournit ; chaque slug devient
 * un fichier out/projets/<slug>/index.html.
 */
export function generateStaticParams(): Params[] {
  return caseStudySlugs().map((slug) => ({ slug }));
}

// Aucun slug hors de cette liste ne doit être servi (sinon erreur de build).
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return {};
  const title = `${study.project.title} — ${profile.name}`;
  return {
    title,
    description: study.project.summary,
    openGraph: { title, description: study.project.summary, type: "article" },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();
  const { project: p, html } = study;

  return (
    <>
      <a href="#main" className="skip-link">Aller au contenu</a>
      <Header />
      <main id="main" className="container case-study">
        <nav className="breadcrumb" aria-label="Fil d'Ariane">
          <Link href="/#projects">← Tous les projets</Link>
        </nav>

        <header className="case-header">
          <p className="mono muted">
            {p.context} · {p.period}
            {p.status && <> · <span className="badge">{p.status}</span></>}
          </p>
          <h1>{p.title}</h1>
          <p className="case-summary">{p.summary}</p>
          <ul className="tags">
            {p.stack.map((s) => <li key={s} className="tag">{s}</li>)}
          </ul>
          {p.links && p.links.length > 0 && (
            <div className="project-links">
              {p.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
              ))}
            </div>
          )}
        </header>

        {/* HTML produit au build à partir de notre propre Markdown */}
        <article className="prose case-body" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
      <Footer />
    </>
  );
}
