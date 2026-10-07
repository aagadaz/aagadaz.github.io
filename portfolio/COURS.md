# Cours — Architecture d'un portfolio Next.js moderne

> Objectif : comprendre **chaque décision** de ce projet, pas seulement le code.
> On procède comme en cours d'architecture logicielle : problème → contraintes → solution → compromis.

---

## Chapitre 0 — Analyse du modèle et cahier des charges

Le site de référence (yaya237.github.io) est une **one-page** : un hero, un « à propos », des cartes projets avec
badges de technologies, un contact. C'est un site HTML statique servi par GitHub Pages.

Ce qu'on garde : la structure linéaire, les cartes projets + badges, les ancres `#projects`, `#contact`.
Ce qu'on ajoute :

| Exigence | Réponse technique |
|---|---|
| Contenu facile à maintenir | Données séparées de la vue (`data/profile.ts`) |
| Thème clair/sombre sans flash | Design tokens CSS + script bloquant |
| Performance maximale | Server Components + export statique |
| Accessibilité | HTML sémantique, ARIA, `prefers-reduced-motion` |
| Déploiement automatisé | GitHub Actions → Pages (ou Vercel) |

**Principe directeur : séparation des préoccupations (Separation of Concerns).** Données, structure (JSX),
présentation (CSS), comportement (JS client) vivent dans des couches distinctes.

---

## Chapitre 1 — Le socle : configuration

### 1.1 `package.json`
Dépendances volontairement minimales : `next`, `react`, `react-dom`, deux paquets de polices. Pas de Tailwind,
pas de framer-motion. **Chaque dépendance est une dette** (mises à jour, failles, poids du bundle). Pour un site de
cette taille, le CSS natif moderne (variables, `color-mix`, `clamp`, grid) suffit — et c'est pédagogiquement plus clair.

Le script `typecheck` (`tsc --noEmit`) vérifie les types **sans produire de fichiers** : Next compile via SWC, qui
transpile le TS mais *ne vérifie pas* les types. D'où l'intérêt de le lancer en CI.

### 1.2 `tsconfig.json` — options clés
- `strict: true` : active `strictNullChecks`, `noImplicitAny`, etc. Le compilateur devient un assistant de preuve.
- `noUncheckedIndexedAccess: true` : `tableau[i]` est typé `T | undefined`. Plus contraignant, mais c'est la
  vérité à l'exécution — tu élimines une classe entière de bugs `Cannot read properties of undefined`.
- `moduleResolution: "bundler"` : résolution alignée sur les bundlers modernes (exports conditionnels des paquets).
- `paths: { "@/*": ["./*"] }` : imports absolus `@/data/profile` au lieu de `../../data/profile`. Le code devient
  insensible aux déplacements de fichiers.

### 1.3 `next.config.ts` — l'export statique
`output: "export"` transforme Next.js en **générateur de site statique (SSG)** : `next build` produit `out/`,
du HTML/CSS/JS pur. Conséquences :

- ✅ hébergeable partout (CDN, GitHub Pages, S3), coût nul, surface d'attaque quasi nulle (pas de serveur) ;
- ❌ pas d'API Routes, pas de Server Actions, pas d'optimiseur d'images → d'où `images: { unoptimized: true }`.

Pour un portfolio, le compromis est évident : le contenu ne change qu'au déploiement.

`basePath` : GitHub Pages sert un dépôt `portfolio` sous `/portfolio/`. Sans `basePath`, les assets seraient
cherchés à la racine → 404. On le lit depuis une variable d'environnement pour que **le même code** marche sur
Vercel (racine) et Pages (sous-dossier). C'est le principe des *12-Factor Apps* : la config vient de l'environnement.

`trailingSlash: true` génère `about/index.html` plutôt que `about.html` — compatible avec tous les hébergeurs statiques.

---

## Chapitre 2 — La couche données : `data/profile.ts`

C'est le fichier le plus important architecturalement. Il applique deux idées :

**1. Single Source of Truth.** Tout le texte est ici. Les composants sont des fonctions pures
`données → UI`. Modifier un projet ne touche jamais au JSX.

**2. Les types comme contrat.** L'interface `Project` documente *et impose* la forme d'un projet :

```ts
export interface Project {
  slug: string;
  category: ProjectCategory;   // union littérale : "ML / IA" | "Full-stack" | "Signal"
  status?: "en cours";         // optionnel
  ...
}
```

Si tu écris `category: "ML"` (faute de frappe), **la compilation échoue**. Une union de littéraux est un
*type somme* : l'ensemble des valeurs possibles est fini et connu du compilateur.

**`as const`** sur `profile` et `navLinks` : TypeScript infère alors des types littéraux en lecture seule
(`"#about"` et non `string`). On fige les données : impossible de les muter par accident.

**Le `slug`** sert de `key` React. Une clé doit être *stable* et *unique* : jamais l'index du tableau si la
liste peut être filtrée ou réordonnée (React réutiliserait le mauvais nœud DOM).

**`cvUrl` et le basePath** : le composant `<Link>` de Next ajoute le basePath automatiquement, mais un `<a>` brut
non. On préfixe donc manuellement avec `process.env.NEXT_PUBLIC_BASE_PATH`. Le préfixe `NEXT_PUBLIC_` signale à Next
que la variable peut être **inlinée dans le code client** au build ; les autres variables restent côté serveur
(protection contre la fuite de secrets).

---

## Chapitre 3 — Le rendu : Server vs Client Components

C'est LE concept central de l'App Router (React Server Components).

| | Server Component (défaut) | Client Component (`"use client"`) |
|---|---|---|
| Où il s'exécute | Au build / sur le serveur | Serveur (HTML initial) **puis** navigateur |
| JS envoyé au client | **Aucun** | Son code + ses dépendances |
| Hooks (`useState`, `useEffect`) | ❌ | ✅ |
| Accès au DOM, `localStorage` | ❌ | ✅ (dans les effets) |

**Règle d'ingénierie : pousser `"use client"` le plus bas possible dans l'arbre.** Dans ce projet, seuls trois
composants sont clients :

- `ThemeToggle` — gère un clic et `localStorage` ;
- `Reveal` — utilise `IntersectionObserver` ;
- `Projects` — l'état du filtre.

`Header` est un Server Component qui *contient* un Client Component (`ThemeToggle`). C'est le pattern des
**îlots d'interactivité** (islands architecture) : une mer de HTML statique, quelques îlots hydratés.

Résultat mesuré au build : la page fait **2,67 kB** de JS propre (+ le runtime React partagé).

> Subtilité : `About` (serveur) passe des enfants à `Reveal` (client). C'est autorisé : les `children` sont
> rendus côté serveur puis transmis comme du contenu déjà calculé. Le client ne reçoit pas le code d'`About`.

### `layout.tsx` et `page.tsx`
Dans l'App Router, le système de fichiers **est** le routeur. `layout.tsx` enveloppe toutes les pages (le
`<html>`, les polices, le CSS global) ; `page.tsx` est le contenu de la route `/`.

`export const metadata` : Next génère les balises `<title>`, `<meta description>`, Open Graph. C'est déclaratif
et typé (`Metadata`) — fini les `<Head>` manuels.

---

## Chapitre 4 — Le thème clair/sombre (le problème le plus subtil du projet)

### 4.1 Les design tokens
Dans `globals.css`, aucune couleur n'est écrite en dur dans les composants. Tout passe par des **propriétés
personnalisées** :

```css
:root                    { --bg: #fafaf9; --text: #18181b; --accent: #4f46e5; }
:root[data-theme="dark"] { --bg: #0c0c0e; --text: #ececf1; --accent: #8b85ff; }
```

Changer de thème = changer **un attribut** sur `<html>`. La cascade CSS propage tout. C'est une indirection
(comme une interface en POO) : les composants dépendent d'une abstraction (`--accent`), pas d'une implémentation (`#4f46e5`).

Note : l'accent est **plus clair en sombre** (`#8b85ff`). Un même violet sur fond noir n'aurait pas un contraste
suffisant (critère WCAG AA : 4,5:1 pour le texte).

`color-mix(in srgb, var(--accent) 10%, transparent)` dérive des nuances à partir d'un seul token : un seul
endroit à changer pour recolorer tout le site.

`color-scheme: dark` indique au navigateur de styliser aussi ses éléments natifs (scrollbars, inputs).

### 4.2 Le problème du FOUC (Flash Of Unstyled/incorrect Content)
Séquence naïve : HTML statique (thème clair) → affichage → JS chargé → React hydrate → lit `localStorage` →
passe en sombre. L'utilisateur voit un **flash blanc** de ~100-300 ms. Inacceptable.

Le serveur (ici : le build) **ne peut pas connaître** la préférence du visiteur. La solution est donc un
**script inline bloquant** dans `<head>` :

```js
var t = localStorage.getItem('theme');
if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
document.documentElement.dataset.theme = t;
```

Un `<script>` sans `async/defer` bloque le parseur HTML : il s'exécute **avant le premier paint**. Le navigateur
peint directement avec le bon thème. Ordre de priorité : choix explicite mémorisé > préférence OS > clair.
Le `try/catch` couvre les navigateurs où `localStorage` lève une exception (Safari privé, cookies bloqués).

### 4.3 L'hydratation et `suppressHydrationWarning`
React compare le HTML du serveur et le DOM client. Ici, `<html>` a un `data-theme` côté client que le serveur
n'a pas produit → avertissement. `suppressHydrationWarning` dit à React : « cette différence est voulue »
(il ne s'applique qu'à un niveau, pas aux enfants).

### 4.4 Pourquoi l'icône est gérée en CSS
`ThemeToggle` rend **les deux** SVG ; le CSS masque le mauvais selon `data-theme`. Si on choisissait l'icône en
JS (`theme === 'dark' ? <Moon/> : <Sun/>`), le HTML statique contiendrait toujours la même icône → mauvais
pictogramme jusqu'à l'hydratation. Leçon générale : **tout ce qui dépend d'un état connu avant React doit être
exprimé en CSS**.

Le `useState<Theme | null>(null)` initial reflète l'honnêteté du modèle : au rendu serveur, le thème est *inconnu*.

---

## Chapitre 5 — Les animations : `Reveal` et `IntersectionObserver`

Approche naïve : `window.addEventListener('scroll', ...)` + `getBoundingClientRect()` à chaque événement.
Problème : le scroll émet des dizaines d'événements par seconde, et `getBoundingClientRect` force un **reflow**
synchrone (layout thrashing). Sur mobile, ça saccade.

`IntersectionObserver` délègue le calcul au navigateur, de façon asynchrone et optimisée. On déclare *quoi
observer* et *quel seuil* :

- `threshold: 0.12` : déclenche quand 12 % de l'élément est visible ;
- `rootMargin: "0px 0px -40px 0px"` : rétrécit la zone de détection de 40 px en bas, pour que l'animation parte
  un peu après l'entrée à l'écran (plus naturel).

Après la première apparition, `observer.disconnect()` : on ne paie plus rien. La fonction retournée par
`useEffect` (`return () => observer.disconnect()`) est le **nettoyage** — exécuté au démontage, il évite les fuites mémoire.

**Pourquoi un état React plutôt que `classList.add` ?** La première version modifiait le DOM directement. Bug
latent : si le composant re-rend, React réécrit `className` depuis le JSX et **efface** la classe ajoutée à la main.
Règle : *React doit être la seule source de vérité du DOM qu'il gère.* D'où `useState(visible)`.

L'animation elle-même est en CSS (`opacity` + `transform`). Ce sont les deux seules propriétés que le navigateur
anime sur le **compositeur GPU** sans relancer layout ni paint → 60 fps garantis.

Prop polymorphe `as` : `<Reveal as="li">` permet de garder une sémantique HTML correcte (un `<li>` dans un `<ol>`)
sans ajouter de `<div>` parasite.

### Accessibilité des animations
- `@media (prefers-reduced-motion: reduce)` : certains utilisateurs (troubles vestibulaires) désactivent les
  animations dans leur OS. On respecte ce choix.
- `@media (scripting: none)` : sans JS, `.reveal` resterait à `opacity: 0` → contenu invisible. On le force visible.

---

## Chapitre 6 — Le filtre de projets (état local et performance)

```ts
const FILTERS: Filter[] = ["Tous", ...Array.from(new Set(projects.map((p) => p.category)))];
```
Les filtres sont **dérivés des données** (pas codés en dur). Un `Set` déduplique. Ajouter un projet d'une
nouvelle catégorie crée le bouton automatiquement — principe *Open/Closed* : ouvert à l'extension, fermé à la modification.

`useMemo` mémorise la liste filtrée tant que `filter` ne change pas. Honnêtement, sur 6 éléments le gain est
négligeable ; il est là comme bonne pratique, à connaître : `useMemo` a lui-même un coût, il se justifie pour des
calculs lourds ou pour stabiliser une référence passée à un enfant mémoïsé.

**Accessibilité :**
- `aria-pressed` sur les boutons : ce sont des *toggle buttons* ; le lecteur d'écran annonce « enfoncé ».
  Bonus : le CSS cible `.chip[aria-pressed="true"]` — **l'état ARIA sert de sélecteur de style**, impossible
  d'avoir un style désynchronisé de l'accessibilité.
- `aria-live="polite"` : annonce « 2 projet(s) affiché(s) » après un filtrage, sans interrompre l'utilisateur.

L'animation `card-in` rejoue à chaque montage de carte : quand on filtre, les cartes apparaissent en fondu.

---

## Chapitre 7 — HTML sémantique et accessibilité

- `<header>`, `<nav aria-label>`, `<main id="main">`, `<section aria-labelledby>`, `<footer>` : les *landmarks*
  permettent aux lecteurs d'écran de sauter de zone en zone.
- **Skip link** (« Aller au contenu ») : invisible jusqu'au focus clavier ; évite de tabuler à travers la nav à chaque page.
- `<dl>/<dt>/<dd>` pour les « facts » : c'est une liste de paires clé/valeur, la balise exacte existe.
- `<ol>` pour la timeline : l'ordre a un sens.
- `:focus-visible` : contour visible **au clavier** uniquement, pas au clic souris.
- Liens externes : `rel="noopener noreferrer"` avec `target="_blank"` empêche la page ouverte d'accéder à
  `window.opener` (attaque de *tabnabbing*).
- `.sr-only` : visible pour les lecteurs d'écran, invisible à l'écran (technique du clip, pas `display:none` qui
  masquerait aussi pour les technologies d'assistance).

---

## Chapitre 8 — CSS moderne : les outils utilisés

- **`clamp(min, préféré, max)`** : typographie fluide. `font-size: clamp(2.6rem, 7vw, 4.6rem)` grandit avec
  l'écran entre deux bornes, **sans media query**.
- **`grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`** : grille responsive intrinsèque. Le
  navigateur calcule lui-même le nombre de colonnes. Les media queries ne servent plus qu'aux vrais changements de layout.
- **`position: sticky` + `backdrop-filter: blur()`** : header en verre dépoli qui reste en haut.
- **`scroll-padding-top`** : sans lui, cliquer sur `#projects` placerait le titre *sous* le header collant.
- **`background-clip: text`** : le dégradé du sous-titre du hero.
- **`margin-top: auto`** dans un flex en colonne : pousse les badges en bas de chaque carte → cartes alignées
  même avec des textes de longueurs différentes.

---

## Chapitre 9 — Polices auto-hébergées

Choix initial : `next/font/google`, qui télécharge les polices au build. Problème rencontré : le build échouait
dans un environnement sans accès à Google Fonts. Solution : **`@fontsource-variable`**, qui fournit les fichiers
`.woff2` via npm.

Avantages : build **reproductible hors-ligne** (CI plus fiable), aucune requête vers Google côté visiteur
(argument RGPD — un tribunal allemand a déjà sanctionné l'appel direct à Google Fonts), et polices *variables* :
un seul fichier couvre toutes les graisses (100 → 900).

---

## Chapitre 10 — CI/CD : `.github/workflows/deploy.yml`

Pipeline en deux jobs :

1. **build** : `npm ci` (installation *exacte* depuis `package-lock.json`, contrairement à `npm install` qui peut
   le modifier) → `typecheck` (porte de qualité : un type faux bloque le déploiement) → `build` → upload de `out/`.
2. **deploy** : publie l'artefact sur Pages. `needs: build` crée la dépendance.

Points notables :
- `permissions: id-token: write` : authentification **OIDC**, GitHub émet un jeton éphémère. Aucun secret stocké.
- `concurrency: cancel-in-progress` : deux pushs rapprochés → seul le dernier se déploie.
- `cache: npm` : réutilise le cache des paquets entre runs.
- `.nojekyll` : GitHub Pages passe par Jekyll par défaut, qui **ignore les dossiers commençant par `_`**… dont
  `_next/`. Sans ce fichier, le site serait cassé.

Sur **Vercel** (ta stack habituelle), tout cela est implicite : push → preview par branche → production sur `main`.

---

## Chapitre 11 — Vérification effectuée

- `tsc --noEmit` : 0 erreur.
- `next build` : export statique OK, page `/` à 2,67 kB de JS propre.
- Tests navigateur (Playwright) : bascule de thème + persistance après rechargement, filtre (6 → 2 cartes sur
  « Signal »), absence de débordement horizontal à 390 px, 0 erreur console.

---

## Exercices pour aller plus loin

1. **Pages projet** : crée `app/projects/[slug]/page.tsx` avec `generateStaticParams()` pour pré-générer une page par projet.
2. **Contenu en MDX** : déplace les descriptions longues dans des fichiers `.mdx`.
3. **Internationalisation** : version anglaise (`/en`) — pertinent vu les candidatures internationales.
4. **Lighthouse en CI** : ajoute `treosh/lighthouse-ci-action` et fais échouer le build sous 95 en performance.
5. **Menu mobile** : actuellement la nav est masquée sous 760 px ; implémente un menu burger accessible
   (`aria-expanded`, gestion du focus, fermeture à `Échap`).
