"use client";

import { useMemo, useState } from "react";
import { projects, type Project, type ProjectCategory } from "@/data/profile";
import { SectionHeading } from "./SectionHeading";

type Filter = "Tous" | ProjectCategory;

// Catégories dérivées des données : ajouter un projet d'une nouvelle
// catégorie crée automatiquement le bouton de filtre correspondant.
const FILTERS: Filter[] = ["Tous", ...Array.from(new Set(projects.map((p) => p.category)))];

export function Projects() {
  const [filter, setFilter] = useState<Filter>("Tous");

  const visible = useMemo(
    () => (filter === "Tous" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  return (
    <section id="projects" className="section container" aria-labelledby="projects-title">
      <SectionHeading index="04" title="Projets" id="projects-title" />

      <div className="filters" role="group" aria-label="Filtrer les projets">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className="chip"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* aria-live : les lecteurs d'écran annoncent le changement de résultat */}
      <p className="sr-only" aria-live="polite">{visible.length} projet(s) affiché(s)</p>

      <ul className="projects-grid">
        {visible.map((p) => <ProjectCard key={p.slug} project={p} />)}
      </ul>
    </section>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  return (
    <li className="card project-card">
      <div className="project-top">
        <span className="mono muted">{p.context} · {p.period}</span>
        {p.status && <span className="badge">{p.status}</span>}
      </div>
      <h3>{p.title}</h3>
      <p className="muted">{p.summary}</p>
      <ul className="project-highlights">
        {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
      </ul>
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
    </li>
  );
}
