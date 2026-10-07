/**
 * SOURCE UNIQUE DE VÉRITÉ du portfolio.
 * Tout le texte du site vit ici : les composants ne font que l'afficher.
 * Pour ajouter un projet, ajoute un objet dans `projects` — rien d'autre à toucher.
 *
 * ⚠️ Les champs marqués TODO sont à compléter (liens GitHub/LinkedIn, CV…).
 */

// ---------- Types (le "contrat" des données) ----------

export type ProjectCategory = "ML / IA" | "Full-stack" | "Signal";

export interface Project {
  slug: string;              // identifiant stable, sert de `key` React
  title: string;
  context: string;           // entreprise / cadre (stage, perso…)
  period: string;
  summary: string;           // une phrase d'accroche
  highlights: string[];      // réalisations concrètes, chiffrées si possible
  stack: string[];
  category: ProjectCategory;
  status?: "en cours";       // optionnel : affiche un badge
  links?: { label: string; href: string }[];
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

// ---------- Identité ----------

export const profile = {
  name: "Afzal",                     // TODO: nom complet
  initials: "AF",
  title: "ML Engineer · Full-stack",
  tagline:
    "Je conçois des modèles de machine learning et les applications qui les mettent en production — du feature engineering jusqu'à l'interface.",
  location: "Paris, France",
  availability: "Disponible pour un CDI",
  email: "afgadazi@gmail.com",
  // Un <a> brut n'ajoute pas le basePath (contrairement à <Link>) : on le préfixe nous-mêmes.
  cvUrl: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/cv.pdf`, // TODO: dépose ton CV dans public/cv.pdf
  socials: [
    { label: "GitHub", href: "https://github.com/" },          // TODO
    { label: "LinkedIn", href: "https://www.linkedin.com/" },  // TODO
  ],
  about: [
    "Ingénieur ESEO (option Data Science), je travaille à l'intersection du machine learning et du développement produit. Chez OKTee, j'ai porté un modèle XGBoost de prévision de bout en bout — données, entraînement, pipeline nocturne, intégration dans un SaaS Next.js.",
    "Avant cela, deux expériences en ML appliqué au traitement du signal (radar GPR, ultrasons) m'ont appris la rigueur expérimentale et les contraintes du monde industriel. Aujourd'hui, je m'intéresse particulièrement aux architectures hybrides LLM + ML classique et à l'industrialisation (MLOps).",
  ],
  facts: [
    { label: "Formation", value: "ESEO · Data Science" },
    { label: "Anglais", value: "TOEIC 910" },
    { label: "Basé à", value: "Paris" },
  ],
} as const;

// ---------- Compétences ----------

export const skills: SkillGroup[] = [
  { label: "Machine Learning", items: ["Python", "XGBoost", "scikit-learn", "pandas", "Feature engineering", "Évaluation (AUC, calibration)"] },
  { label: "IA générative", items: ["LLM APIs", "Embeddings", "Analyse sémantique", "Scoring", "Architectures hybrides"] },
  { label: "Full-stack", items: ["TypeScript", "React", "Next.js", "Node.js", "API REST", "PostgreSQL"] },
  { label: "Prod & outils", items: ["Vercel", "Railway", "Inngest", "GitHub Actions", "Linear", "Figma", "Postman"] },
];

// ---------- Expériences ----------

export const experiences: Experience[] = [
  {
    company: "OKTee",
    role: "ML Engineer / Développeur full-stack (stage de fin d'études)",
    period: "Déc. 2025 — Juil. 2026",
    location: "Paris",
    bullets: [
      "Modèle XGBoost de « taux de captation » sur 4 horizons temporels (64 features, AUC 0,83).",
      "Pipeline d'inférence nocturne orchestré avec Inngest sur Railway ; ownership du cycle MLOps.",
      "Conception du schéma PostgreSQL, qualité et intégrité des données.",
      "Intégrations LLM / embeddings dans le SaaS (Next.js App Router, Node.js).",
    ],
  },
  {
    company: "FI-NDT",
    role: "Stage — Machine Learning",
    period: "Avr. — Août 2025",
    location: "Angers",
    bullets: ["Machine learning appliqué aux signaux radar GPR (géoradar) pour le contrôle non destructif."],
  },
  {
    company: "Evident",
    role: "Stage — Machine Learning",
    period: "Sept. 2024 — Janv. 2025",
    location: "Angers",
    bullets: ["Machine learning sur signaux ultrasons ; PoC de faisabilité d'une implémentation sur système embarqué."],
  },
];

// ---------- Projets ----------

export const projects: Project[] = [
  {
    slug: "oktee-captation",
    title: "Prévision du taux de captation",
    context: "OKTee",
    period: "2026",
    summary: "Modèle XGBoost multi-horizon en production, réentraîné et servi chaque nuit.",
    highlights: [
      "4 horizons de prévision, 64 features construites à partir de l'historique commandes",
      "AUC 0,83 sur jeu de test temporel",
      "Pipeline nocturne Inngest → écriture des scores en base → affichage dans le SaaS",
    ],
    stack: ["Python", "XGBoost", "Inngest", "Railway", "PostgreSQL"],
    category: "ML / IA",
  },
  {
    slug: "oktee-saas",
    title: "SaaS de pilotage par la donnée",
    context: "OKTee",
    period: "2026",
    summary: "Application full-stack qui transforme le traitement des commandes en tableau de pilotage.",
    highlights: [
      "Architecture Next.js App Router + API REST Node.js",
      "Modélisation PostgreSQL et garantie de l'intégrité des données",
      "Fonctionnalités IA : embeddings, analyse sémantique, scoring LLM",
    ],
    stack: ["TypeScript", "Next.js", "Node.js", "PostgreSQL", "LLM"],
    category: "Full-stack",
  },
  {
    slug: "hybrid-reorder",
    title: "Prédiction de réassort hybride LLM + ML",
    context: "OKTee — R&D",
    period: "2026",
    summary: "Exploration d'une architecture combinant modèle tabulaire et LLM pour anticiper les réassorts.",
    highlights: [
      "Données marketplace via Amazon SP-API",
      "Le ML classique prédit, le LLM contextualise et explique",
    ],
    stack: ["Python", "LLM", "Embeddings", "Amazon SP-API"],
    category: "ML / IA",
  },
  {
    slug: "epargne",
    title: "Assistant d'épargne",
    context: "Projet personnel",
    period: "2026",
    summary: "SaaS qui aide les particuliers à épargner régulièrement.",
    highlights: ["Next.js + PostgreSQL, déploiement Vercel", "Briques IA pour la catégorisation et le conseil"],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Vercel"],
    category: "Full-stack",
    status: "en cours",
  },
  {
    slug: "gpr",
    title: "ML sur signaux radar GPR",
    context: "FI-NDT",
    period: "2025",
    summary: "Détection automatique dans des radargrammes de géoradar pour le contrôle non destructif.",
    highlights: ["Prétraitement de signaux radar", "Modèles de classification / détection"],
    stack: ["Python", "Traitement du signal", "ML"],
    category: "Signal",
  },
  {
    slug: "ultrasons",
    title: "ML embarqué sur signaux ultrasons",
    context: "Evident",
    period: "2024 — 2025",
    summary: "PoC évaluant la faisabilité d'un modèle ML sur système embarqué.",
    highlights: ["Analyse de signaux ultrasons", "Contraintes mémoire / latence de l'embarqué"],
    stack: ["Python", "Traitement du signal", "Embarqué"],
    category: "Signal",
  },
];

export const navLinks = [
  { href: "#about", label: "À propos" },
  { href: "#experience", label: "Parcours" },
  { href: "#projects", label: "Projets" },
  { href: "#contact", label: "Contact" },
] as const;
