## Contexte

The Financial Eyes est une plateforme d'investissement *value* sur les actions européennes : un portefeuille modèle suivi publiquement, des analyses fondamentales, et des outils de diagnostic pour l'investisseur qui préfère la rigueur au bruit.

Le produit a trois types de visiteurs, avec des droits différents : le public, qui voit le portefeuille et les analyses en lecture ; les membres connectés, avec un espace personnel (performance, screener, calculateur, diagnostic) ; et l'administrateur, qui gère les positions et les contenus. L'enjeu technique principal est donc de servir ces trois niveaux sur une même application, vite, et sans qu'un niveau puisse accéder à ce qui est réservé au suivant.

## Contraintes

- **Performance partout.** Les pages publiques doivent se charger instantanément, y compris pour un visiteur lointain, sans coût serveur inutile.
- **Sécurité en profondeur.** Un espace membre et un espace admin sur le même domaine : la protection ne peut pas reposer sur une seule vérification.
- **Un seul développeur.** Chaque choix doit minimiser le code à maintenir : pas de framework CSS lourd, pas d'API intermédiaire là où Next.js sait faire.
- **Données financières.** Les chiffres doivent être alignés et lisibles (chiffres tabulaires), et chaque page de performance doit rappeler que les performances passées ne préjugent pas des performances futures.

## Approche

### Trois couches d'authentification

La vérification d'accès est faite trois fois, à trois endroits différents, et c'est voulu.

1. **Le middleware**, qui s'exécute à l'Edge de Vercel, au plus près du visiteur, avant que la requête n'atteigne le serveur Node. Il ne prend qu'une décision binaire : rediriger vers la connexion, ou laisser passer. Un visiteur non connecté qui demande `/dashboard` est rejeté en quelques dizaines de millisecondes, sans qu'aucune fonction serverless ne soit facturée. Pour `/admin`, il vérifie en plus que l'e-mail figure dans une liste blanche.
2. **Le layout du dashboard**, qui relit la session côté serveur avant de rendre la barre latérale.
3. **Chaque Server Action de mutation** (créer, modifier, supprimer une position), qui re-vérifie la session et le rôle admin. Un bug dans le middleware ne doit jamais laisser passer une mutation.

### JWT plutôt que session en base, à cause de l'Edge

Le choix de la stratégie de session découle de l'architecture. NextAuth propose deux stratégies : `database` (la session est une ligne en base, lue à chaque requête) et `jwt` (la session est un cookie signé). Le middleware tourne sur l'Edge Runtime, où Prisma ne peut pas se connecter à PostgreSQL. Avec `database`, chaque passage dans le middleware tentait une requête impossible, échouait silencieusement, et l'utilisateur paraissait déconnecté alors que sa session existait.

La stratégie `jwt` règle le problème : l'Edge lit le cookie sans base. Le compromis est connu et documenté dans le code : on perd la révocation immédiate côté serveur (un cookie reste valide jusqu'à son expiration), ce qui est acceptable pour cette version. Les comptes OAuth restent persistés en base via l'adaptateur Prisma ; seule la session change de support. La durée de vie est de 30 jours, avec un rafraîchissement du cookie après 24 h d'inactivité.

### Server Components par défaut

Toutes les pages sont des Server Components. Le rendu se fait côté serveur, le navigateur reçoit du HTML, et seul le strict nécessaire devient Client Component (formulaires contrôlés, modales). La page d'accueil publique est régénérée par ISR toutes les heures : elle est servie depuis le CDN et ne touche la base qu'une fois par heure.

Le graphique de performance illustre ce principe : plutôt que d'ajouter Chart.js, qui aurait imposé un Client Component et son JavaScript, la courbe est dessinée en SVG pur, côté serveur, à partir des points lus en base. Zéro JavaScript envoyé pour afficher un graphique.

### Server Actions pour les mutations

Les opérations d'administration (CRUD des positions du portefeuille) sont des Server Actions plutôt que des routes API : le formulaire est intercepté par Next.js, la validation est systématiquement côté serveur, et chaque action invalide précisément les pages concernées (`/portefeuille` public, `/dashboard/portefeuille`, `/admin/positions`) pour que le cache reste cohérent après une modification.

### Un système de design en tokens

Le style repose sur Tailwind v4 configuré en CSS, avec une palette en trois couleurs (navy, forest, cream) et une règle stricte : jamais de couleur en dur dans un composant, toujours un token. Les chiffres financiers sont en `tabular-nums` partout pour que les colonnes s'alignent.

### Le modèle de données

Le schéma Prisma distingue les **positions** du portefeuille modèle (ticker, poids, secteur, pays, et ratios fondamentaux : PER, PBR, rendement du FCF, ROIC, rendement du dividende) avec un drapeau `isPublic` qui contrôle ce que le visiteur non connecté peut voir, l'**historique de performance**, les **utilisateurs** avec leur plan (gratuit, essentiel, pro) et les tables d'abonnement prévues pour Stripe.

## Résultats

Le socle est en place et déployé sur Vercel : pages publiques, connexion Google, espace membre protégé, espace admin avec gestion des positions, page de performance avec métriques et courbe.

Les prochaines étapes sont le diagnostic de portefeuille (import CSV puis rapport généré par Claude), le screener avec filtres et pagination, et l'intégration Stripe pour les abonnements.

## Ce que j'ai appris

- **Lire les contraintes du runtime avant de choisir une stratégie.** Le passage de `database` à `jwt` est venu d'un bug : l'Edge ne parle pas à PostgreSQL. La décision correcte était écrite dans la documentation de la plateforme, pas dans celle de la bibliothèque.
- **La défense en profondeur coûte quelques lignes et évite une catégorie entière d'incidents.** Trois vérifications, c'est une redondance assumée.
- **Chaque dépendance côté client a un prix.** Un SVG généré sur le serveur fait le même travail qu'une bibliothèque de graphiques, sans un kilo-octet de JavaScript. La bibliothèque viendra quand l'interactivité la justifiera.
