/**
 * SOURCE UNIQUE DE VÉRITÉ du portfolio.
 * Tout le texte du site vit ici : les composants ne font que l'afficher.
 * Pour ajouter un projet, ajoute un objet dans `projects` — rien d'autre à toucher.
 *
 * Contenu aligné sur le CV (public/cv.pdf) : si tu modifies l'un, pense à l'autre.
 */

// ---------- Types (le "contrat" des données) ----------

// L'ordre de ce tableau fixe l'ordre des boutons de filtre (cf. Projects.tsx).
export const PROJECT_CATEGORIES = ["IA générative", "Machine Learning", "Full-stack", "Signal"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export interface Project {
  slug: string;              // identifiant stable, sert de `key` React
  title: string;
  context: string;           // entreprise / cadre (stage, perso…)
  period: string;
  summary: string;           // une phrase d'accroche
  highlights: string[];      // réalisations concrètes, chiffrées si possible
  stack: string[];
  category: ProjectCategory;
  featured?: boolean;        // optionnel : carte mise en avant (pleine largeur)
  status?: "en cours";       // optionnel : affiche un badge
  links?: { label: string; href: string }[];
}

export interface Experience {
  company: string;
  companyUrl?: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
}

export interface Education {
  school: string;
  degree: string;
  period: string;
  location: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

// ---------- Identité ----------

export const profile = {
  name: "Afzal Agadazi",
  initials: "AA",
  title: "Ingénieur Data Science & IA",
  tagline:
    "Je conçois des modèles de machine learning et les applications qui les mettent entre les mains des utilisateurs — du signal brut jusqu'au dashboard en production.",
  location: "Paris, France",
  availability: "Disponible pour un CDI",
  email: "afgadazi@gmail.com",
  // Un <a> brut n'ajoute pas le basePath (contrairement à <Link>) : on le préfixe nous-mêmes.
  cvUrl: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/cv.pdf`,
  socials: [
    { label: "GitHub", href: "https://github.com/aagadaz" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/afzal-agadazi/" },
  ],
  about: [
    "Issu du cycle ingénieur de l'ESEO (option Data Science), je travaille à l'intersection du machine learning et du produit. Chez OKTee, SaaS de pilotage Amazon Vendor Central, j'ai remplacé un réassort fait à la main sur Excel par un outil d'aide à la décision : un modèle de prévision qui note chaque produit, intégré à l'application Next.js.",
    "Avant cela, deux stages en ML appliqué au signal (radar GPR chez FI-NDT, ultrasons chez Evident) m'ont appris à automatiser des diagnostics jusque-là faits à l'œil par des experts, avec des objectifs chiffrés à tenir. Aujourd'hui, je construis aussi mes propres outils : un agent de recherche d'emploi propulsé par Claude, et une plateforme d'investissement.",
  ],
  facts: [
    { label: "Formation", value: "ESEO · option Data Science" },
    { label: "Langues", value: "Français · Anglais (TOEIC 910)" },
    { label: "Certification", value: "IBM — Python for Data Science, AI & Development" },
    { label: "Hors écran", value: "Taekwondo, ceinture noire 2e dan" },
  ],
} as const;

// ---------- Compétences ----------

export const skills: SkillGroup[] = [
  { label: "Machine Learning", items: ["Python", "XGBoost", "scikit-learn", "TensorFlow", "Keras", "pandas", "Feature engineering"] },
  { label: "IA générative", items: ["API Claude / LLM", "Tool use & sorties structurées", "LangChain", "RAG", "Embeddings", "BERT"] },
  { label: "Full-stack", items: ["TypeScript", "React", "Next.js", "Node.js", "SQL", "PostgreSQL", "Drizzle", "Prisma"] },
  { label: "Prod & outils", items: ["Git", "GitHub Actions", "Vercel", "Railway", "Inngest", "Streamlit", "Linear", "Figma"] },
];

// ---------- Expériences ----------

export const experiences: Experience[] = [
  {
    company: "OKTee",
    companyUrl: "https://www.oktee.io/",
    role: "Data Scientist / Développeur full-stack (stage de fin d'études)",
    period: "Déc. 2025 — Juin 2026",
    location: "Paris",
    bullets: [
      "Refonte d'OKTee Product Performance : 5 dashboards produit avec KPIs temps réel pour piloter un catalogue Amazon de plus de 900 produits.",
      "Module de forecast de réapprovisionnement : pipeline ML (75 % de précision) qui prédit la probabilité de recommande et classe chaque produit en Opportunité, Risque ou À surveiller.",
      "Remplacement d'un processus manuel sur fichiers Excel par un outil d'aide à la décision intégré au SaaS, avec historique de ventes centralisé.",
    ],
  },
  {
    company: "FI-NDT",
    companyUrl: "https://www.fi-ndt.fr/",
    role: "Stage — Machine Learning",
    period: "Avr. — Août 2025",
    location: "Angers",
    bullets: [
      "Automatisation de l'estimation d'épaisseur de matériaux d'infrastructure (ferroviaire, énergie, bâtiment) à partir de signaux radar GPR.",
      "Pipeline complet (prétraitement, modélisation, évaluation) et comparaison de 3 approches : 5 % d'erreurs critiques, pour un objectif fixé à 10 %.",
      "Interface Streamlit livrée aux techniciens : ils chargent leurs mesures et obtiennent une prédiction instantanée.",
    ],
  },
  {
    company: "Evident",
    companyUrl: "https://evidentscientific.com/fr/",
    role: "Stage — Machine Learning",
    period: "Sept. 2024 — Janv. 2025",
    location: "Angers",
    bullets: [
      "Solution ML embarquée d'estimation d'épaisseur de matériaux corrodés à partir de signaux ultrasonores.",
      "Précision finale de 90 % : preuve de concept validée, plus rapide et plus reproductible que l'interprétation manuelle point par point.",
    ],
  },
];

export const education: Education[] = [
  {
    school: "ESEO",
    degree: "Cycle ingénieur généraliste — option Data Science",
    period: "2022 — 2026",
    location: "Angers",
  },
  {
    school: "ESEO",
    degree: "Classes préparatoires intégrées (maths, physique, informatique, SI)",
    period: "2019 — 2022",
    location: "Angers",
  },
];

// ---------- Projets ----------

export const projects: Project[] = [
  {
    slug: "job-agent",
    title: "job-agent — agent de recherche d'emploi",
    context: "Projet personnel",
    period: "2026",
    summary:
      "Chaque matin, l'agent lit le CV, collecte les offres récentes, les fait noter par Claude et ne garde que les plus pertinentes. Né comme script GitHub Actions, il devient une plateforme multi-utilisateur.",
    highlights: [
      "Sorties structurées par tool use forcé (JSON Schema) : un objet typé, pas du texte à parser",
      "Grille de notation explicite sur 100 (compétences, niveau, domaine, conditions) ; le verdict est calculé par le code, pas par le modèle",
      "Sources branchées par pattern Adapter : API Adzuna + 7 ATS de pages carrières (Greenhouse, Lever, Workday…)",
      "Worker idempotent : déduplication par URL normalisée, pool de requêtes concurrentes, retry avec backoff, une source en panne n'arrête pas les autres",
      "Version web : Next.js, NextAuth, PostgreSQL/Drizzle, clés API chiffrées en AES-256-GCM",
    ],
    stack: ["TypeScript", "Claude API", "Next.js", "PostgreSQL", "Drizzle", "GitHub Actions"],
    category: "IA générative",
    featured: true,
    status: "en cours",
    links: [{ label: "Code", href: "https://github.com/aagadaz/job-agent" }],
  },
  {
    slug: "oktee-forecast",
    title: "Forecast de réapprovisionnement",
    context: "OKTee",
    period: "2026",
    summary: "Outil d'aide à la décision qui remplace le réassort manuel sur Excel par un scoring ML de chaque produit.",
    highlights: [
      "Probabilité de recommande prédite avec 75 % de précision",
      "Scoring automatique : Opportunité, Risque, À surveiller",
      "Modèle XGBoost multi-horizon servi par un pipeline nocturne (Inngest sur Railway)",
    ],
    stack: ["Python", "XGBoost", "Inngest", "Railway", "PostgreSQL"],
    category: "Machine Learning",
  },
  {
    slug: "oktee-dashboards",
    title: "OKTee Product Performance",
    context: "OKTee",
    period: "2026",
    summary: "Refonte des dashboards produit d'un SaaS de pilotage Amazon Vendor Central.",
    highlights: [
      "5 dashboards orientés utilisateur, KPIs en temps réel",
      "Plus de 900 produits suivis",
      "Schéma PostgreSQL conçu et qualité des données garantie",
    ],
    stack: ["TypeScript", "Next.js", "Node.js", "PostgreSQL"],
    category: "Full-stack",
  },
  {
    slug: "financial-eyes",
    title: "The Financial Eyes",
    context: "Projet personnel",
    period: "2026",
    summary: "Plateforme d'investissement value sur les actions européennes : portefeuille modèle public, analyses fondamentales, outils de diagnostic.",
    highlights: [
      "Next.js App Router, Server Components par défaut",
      "Authentification Google (NextAuth v5) vérifiée en trois couches : middleware, layout, page",
      "PostgreSQL serverless (Neon) via Prisma, déploiement Vercel",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "Vercel"],
    category: "Full-stack",
    status: "en cours",
  },
  {
    slug: "gpr-epaisseur",
    title: "Estimation d'épaisseur par radar GPR",
    context: "FI-NDT",
    period: "2025",
    summary: "Automatiser une mesure que les experts faisaient à l'œil sur des radargrammes.",
    highlights: [
      "3 approches comparées sur un pipeline complet",
      "5 % d'erreurs critiques pour un objectif de 10 %",
      "Application Streamlit utilisée par les techniciens",
    ],
    stack: ["Python", "Traitement du signal", "Machine Learning", "Streamlit"],
    category: "Signal",
  },
  {
    slug: "ultrasons",
    title: "ML embarqué sur signaux ultrasons",
    context: "Evident",
    period: "2024 — 2025",
    summary: "Estimer l'épaisseur de matériaux corrodés directement sur un système embarqué.",
    highlights: [
      "90 % de précision",
      "Preuve de concept validée face à la méthode manuelle",
    ],
    stack: ["Python", "Machine Learning", "Traitement du signal", "Embarqué"],
    category: "Signal",
  },
  {
    slug: "assistant-dentaire",
    title: "Assistant dentaire intelligent",
    context: "Projet ESEO",
    period: "2023 — 2024",
    summary: "Trier les e-mails de patients par urgence et proposer un créneau de rendez-vous adapté.",
    highlights: [
      "Classification avec BERT : 93 % de précision",
      "Créneaux proposés via l'API Google Calendar selon l'urgence",
    ],
    stack: ["Python", "BERT", "NLP", "Google Calendar API"],
    category: "IA générative",
  },
  {
    slug: "gpr-anomalies",
    title: "Détecteur d'anomalies GPR",
    context: "Projet ESEO",
    period: "2023 — 2024",
    summary: "Repérer automatiquement les décollements de sol dans des signaux radar.",
    highlights: ["Auto-encodeur convolutif (CNN)", "Détection par score d'anomalie (erreur de reconstruction)"],
    stack: ["Python", "Keras", "CNN"],
    category: "Signal",
  },
  {
    slug: "anc",
    title: "Réduction active de bruit",
    context: "Projet ESEO",
    period: "2023 — 2024",
    summary: "Atténuer le bruit dans un conduit de ventilation par filtrage adaptatif.",
    highlights: ["Algorithme de filtrage adaptatif appliqué à un conduit de ventilation"],
    stack: ["Traitement du signal", "Filtrage adaptatif"],
    category: "Signal",
  },
];

export const navLinks = [
  { href: "/#about", label: "À propos" },
  { href: "/#experience", label: "Parcours" },
  { href: "/#projects", label: "Projets" },
  { href: "/#contact", label: "Contact" },
] as const;
