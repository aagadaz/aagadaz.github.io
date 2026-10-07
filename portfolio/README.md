# Portfolio — Afzal

One-page portfolio en **Next.js 15 (App Router) + TypeScript**, export statique, thème clair/sombre.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # génère out/ (site statique)
npm run start      # sert out/ en local
```

## Personnaliser

Tout le contenu est dans **`data/profile.ts`**. Cherche les `TODO` :

- nom complet, liens GitHub / LinkedIn
- dépose ton CV dans `public/cv.pdf`
- ajoute / retire des projets dans le tableau `projects` (le filtre se met à jour seul)

## Déployer

- **Vercel** : importe le dépôt, aucune configuration.
- **GitHub Pages** : Settings → Pages → Source = *GitHub Actions*. Si le dépôt n'est pas `<user>.github.io`,
  crée une variable de dépôt `BASE_PATH` = `/<nom-du-repo>`.

Le cours détaillé sur l'architecture est dans [`COURS.md`](./COURS.md).
