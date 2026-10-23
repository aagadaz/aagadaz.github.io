## Contexte

Chercher un premier CDI, c'est ouvrir chaque matin les mêmes sites, relire des dizaines d'annonces, et trier à la main celles qui méritent une candidature. Le travail est répétitif, et surtout il est mal fait quand on le fait vite : on survole, on rate des offres, on relit des annonces déjà vues.

job-agent automatise ce tri. Chaque matin à 7 h, il collecte les offres publiées récemment, les compare à mon CV, les note de 0 à 100 avec une justification, et ne me présente que celles qui valent le coup. Le projet a commencé comme un script lancé par GitHub Actions, qui écrivait dans un Google Sheet. Il est devenu une application web multi-utilisateur, avec une base PostgreSQL, un fil d'offres par personne et la génération de lettres de motivation.

<div class="flow" aria-label="Pipeline de l'agent">
  <div class="flow-step"><strong>CV</strong><span>texte extrait du PDF</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><strong>Mots-clés</strong><span>Claude, sortie structurée</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><strong>Collecte</strong><span>Adzuna + 7 ATS</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><strong>Entonnoir</strong><span>dédoublonnage, filtres, déjà vues</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><strong>Scoring</strong><span>Claude, grille 0-100</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><strong>Fil d'offres</strong><span>PostgreSQL, interface Next.js</span></div>
</div>

## Contraintes

- **Coût.** Chaque notation est un appel à un LLM, donc payant. Le pipeline doit faire le maximum de tri *gratuit* avant d'appeler le modèle, et ne jamais noter deux fois la même offre.
- **Sources hétérogènes.** Un agrégateur (Adzuna) ne renvoie qu'un extrait de chaque annonce. Les pages carrières des entreprises donnent le texte complet, mais chaque ATS (Greenhouse, Lever, Workday…) a son propre format.
- **Robustesse.** L'agent tourne sans surveillance. Une source en panne, une réponse mal formée ou une limite de débit ne doivent pas faire échouer toute l'exécution.
- **Confidentialité.** Le dépôt est public, donc les logs du workflow aussi. Ils ne doivent rien révéler sur la recherche d'une personne : ni mots-clés, ni villes, ni e-mails.

## Approche

### Des sorties structurées, pas du texte à parser

La première décision concerne la façon d'interroger le modèle. Demander « note cette offre » et lire la réponse en texte libre oblige à parser une prose imprévisible. À la place, le modèle est appelé avec un **outil** décrit par un JSON Schema (`score`, `justification`, `strengths`, `missingSkills`) et un `tool_choice` forcé : il ne peut répondre qu'en remplissant cet objet. Le code reçoit une structure typée.

Le même mécanisme sert en amont pour déduire du CV les 3 à 5 intitulés de poste à rechercher, avec des valeurs par défaut si le modèle ne renvoie rien d'exploitable.

### Une grille explicite, et un verdict calculé par le code

Le prompt système impose une grille : 40 points pour les compétences techniques, 25 pour le niveau d'expérience, 20 pour le domaine, 15 pour les conditions (contrat, localisation). Il demande aussi d'être strict : une compétence n'est créditée que si elle apparaît explicitement dans le CV, et une offre exigeant beaucoup plus d'expérience que le candidat n'en a ne peut pas dépasser 45.

Le verdict (*Postuler*, *À étudier*, *Ignorer*) n'est **pas** demandé au modèle. Il est déduit du score par une fonction de seuils dans le code. Deux raisons : les verdicts restent comparables d'une offre à l'autre, et on peut changer les seuils sans toucher au prompt ni re-noter quoi que ce soit.

### Le pattern Adapter pour les sources

Chaque source est un module qui traduit le format de l'API vers un type commun `JobDetail`. Ajouter une source ne touche ni au scoring, ni à la base, ni à l'interface. Le module des pages carrières couvre sept ATS avec leurs API publiques, celles que les pages carrières appellent elles-mêmes dans le navigateur.

La première version scrapait l'APEC avec Playwright. Le site a fini par bloquer les navigateurs automatisés : passer à des API publiques et documentées a rendu l'agent plus stable et plus respectueux des sites.

### L'entonnoir avant le scoring

Entre la collecte et l'appel au modèle, les offres passent par une série de filtres gratuits, du moins cher au plus cher :

1. **Dédoublonnage inter-sources** par clé métier (entreprise + intitulé normalisés). En cas de doublon, on garde la version la plus riche, en pratique la page carrière plutôt que l'agrégateur.
2. **Filtres sur l'intitulé** : termes exclus (« senior », « lead »), termes requis (« data », « ML »). Les pages carrières publient tous les postes d'une entreprise ; sans ce filtre, on noterait des offres de comptables.
3. **Filtre géographique** pour les pages carrières, qui publient dans le monde entier.
4. **Offres déjà vues**, grâce à une URL normalisée (voir ci-dessous).
5. **Filtre d'expérience** par expression régulière sur « X ans d'expérience », pour ne pas payer la notation d'une offre « 8 ans+ ».
6. **Plafond par exécution**, réglable depuis une page d'administration, pour qu'un premier passage sur 100 entreprises ne déclenche pas des centaines d'appels d'un coup.

### L'idempotence par normalisation d'URL

Relancer l'agent ne doit ni créer de doublon ni re-noter une offre. La clé d'une offre est son URL normalisée : fragment retiré, paramètres de suivi (`utm_*`, `ref`…) retirés, paramètres identifiants conservés et triés. Le choix d'une **liste blanche** de paramètres identifiants plutôt qu'une liste noire est volontaire : un paramètre de suivi inconnu ne doit jamais faire passer une offre déjà vue pour une nouvelle. Cas réel rencontré : certaines entreprises publient via Greenhouse sur leur propre site, et toutes leurs offres ont la même adresse, qui ne diffère que par `?gh_jid=…`.

### Concurrence bornée et tolérance aux pannes

Lancer 100 requêtes d'un coup avec `Promise.all` ouvre 100 connexions : c'est impoli, et souvent bloqué (HTTP 429). Un petit utilitaire `mapPool` applique une fonction à une liste avec au plus *n* appels simultanés, en conservant l'ordre des résultats. Il fonctionne sans verrou parce que JavaScript est mono-thread : l'incrément de l'index est atomique entre deux `await`.

Chaque source est isolée : un échec produit un résultat `rejected`, les autres sources continuent. Les erreurs transitoires (429, 5xx) sont réessayées avec un backoff exponentiel. Une offre dont le scoring échoue est conservée, sans note, plutôt que perdue.

### De script à plateforme

La version web ajoute ce que le Google Sheet ne pouvait pas offrir :

- **Un modèle multi-utilisateur.** Les offres sont partagées entre tous (uniques par URL normalisée), mais le score et le suivi sont personnels, dans une table d'association `user_offers`. La suppression est logique : la ligne reste, pour que le worker sache que l'offre a déjà été vue.
- **Une clé API par utilisateur**, chiffrée en AES-256-GCM avant stockage, jamais en clair en base. Chacun paie ses propres appels au modèle.
- **Deux modes de connexion** : Google OAuth, et lien magique par e-mail, avec une réponse identique que l'adresse ait un compte ou non pour ne pas révéler qui est inscrit.
- **Un bouton « lancer une recherche »** qui déclenche le workflow GitHub Actions via son API, puis suit l'exécution ; la ligne `runs` est créée au clic, et le worker la clôt, en succès ou en erreur.
- **Des réglages modifiables sans redéployer**, stockés en base avec des valeurs par défaut dans le code.
- **Une lettre de motivation** générée pour une offre avec la clé de l'utilisateur, puis retouchable à la main et sauvegardée.

## Résultats

L'agent tourne chaque matin depuis sa mise en place. Le temps de veille quotidien est passé d'une heure de lecture à quelques minutes de revue d'un fil déjà trié, avec pour chaque offre le score, les points forts et les compétences manquantes.

La limite est connue et assumée : Adzuna ne fournit qu'un extrait de chaque annonce, donc le score est un premier tri, pas un verdict. C'est précisément pour ça que les pages carrières, avec le texte complet, ont été ajoutées comme sources.

## Ce que j'ai appris

- **Le modèle est un composant, pas le programme.** Les décisions qui comptent (verdict, seuils, déduplication) restent dans du code testable. Le LLM ne fait que ce qu'il fait mieux que du code : lire une annonce et la comparer à un CV.
- **Le scraping est une dette.** Il casse sans prévenir. Quand une API existe, même moins riche, elle gagne sur la durée.
- **L'idempotence se conçoit dès le début.** Décider de la clé d'une offre a été la décision la plus structurante du projet : elle conditionne la déduplication, le coût, et la confiance qu'on peut avoir dans le fil.
- **Les messages d'erreur sont une interface.** Un ORM qui met la requête SQL et tous ses paramètres dans `.message` peut noyer la vraie cause, qui est dans `.cause`. Remonter la chaîne et borner la longueur, c'est ce qui rend l'erreur lisible dans l'interface.
