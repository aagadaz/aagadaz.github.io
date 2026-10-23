## Contexte

Le projet est né d'un besoin personnel : avoir la documentation de mes bibliothèques (pandas, python-docx…) à portée de main pour retrouver une syntaxe, en posant la question **en français** sur une documentation **écrite en anglais**.

RAG Doc Assistant indexe n'importe quelle documentation technique (PDF, Word, PowerPoint, Excel, pages web, Markdown, code source) et y répond avec des **citations numérotées** et l'affichage des passages utilisés. Il gère les questions de suivi (« et pour la somme ? »), peut résumer un document entier, et refuse d'inventer : si la réponse n'est pas dans les extraits, il le dit.

<div class="flow" aria-label="Architecture du RAG">
  <div class="flow-step"><strong>Chargement</strong><span>multi-format → Document</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><strong>Découpage</strong><span>structurel, en tokens</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><strong>Embeddings</strong><span>e5 multilingue, local</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><strong>Chroma</strong><span>index HNSW persistant</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><strong>Réécriture</strong><span>question → requête EN</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><strong>Réponse</strong><span>Claude, citations [n]</span></div>
</div>

## Contraintes

- **Multilingue.** La question est en français, le corpus en anglais. Le fossé entre les deux est le problème central du projet, et il a fallu le mesurer avant de le résoudre.
- **Coût maîtrisé.** Les embeddings sont calculés en local avec un modèle gratuit ; on ne paie que la génération de la réponse.
- **Code intact.** Dans une documentation technique, un bloc de code dont l'indentation est perdue devient faux. Rien ne doit toucher au code entre l'extraction et la réponse.
- **Testable sans réseau.** La suite de tests doit tourner sans clé API ni téléchargement de modèle.

## Approche

### Mesurer avant d'optimiser

La décision la plus importante du projet a été de construire un **jeu d'évaluation** : 35 questions annotées sur six pages du guide utilisateur de pandas (472 chunks), avec pour chaque question le passage qui contient la réponse. Deux métriques classiques de recherche d'information : le *hit rate@4* (le bon passage est-il dans les 4 premiers ?) et le *MRR@4* (à quel rang ?).

Sans ça, chaque réglage aurait été jugé à l'œil sur deux ou trois questions. Avec, chaque idée se teste en une commande et laisse une trace dans un rapport Markdown.

### Le fossé de langue, et sa solution

| Configuration | Hit rate@4 | MRR@4 |
|---|---|---|
| Similarité pure, questions en français | 60 % | 0,44 |
| Similarité pure, mêmes questions en anglais | 71 % | 0,60 |
| MMR λ = 0,5 | 54 % | 0,41 |
| HyDE (passage hypothétique) | 66 % | 0,60 |
| **Réécriture LLM en anglais + noms d'API** | **100 %** | **0,87** |
| Réécriture + MMR λ = 0,7 (pipeline retenu) | 97 % | 0,86 |

Trois enseignements. D'abord, le modèle d'embedding multilingue ne suffit pas : poser la même question en anglais fait gagner 11 points, donc une partie de l'écart vient bien de la langue. Ensuite, la diversité (MMR) seule n'aide pas : avec λ = 0,5, elle fait entrer des passages hors sujet d'autres documents et *dégrade* le résultat. Enfin, la solution est de faire réécrire la question par le modèle **avant** la recherche : une requête autonome, en anglais, qui devine les noms d'API probables (« moyenne par groupe » devient `groupby mean aggregation`). Le passage de 60 % à 97 % vient de là. HyDE, qui génère un passage de documentation imaginaire pour chercher ses voisins, aide moins : le passage inventé ressemble à la documentation, mais pas forcément à la bonne page.

La réécriture a un second bénéfice : elle intègre l'historique de la conversation, ce qui transforme « et pour la somme ? » en une requête complète. Une seule étape résout les deux problèmes.

### Des chunks mesurés en tokens, pas en caractères

Le premier modèle d'embedding testé (MiniLM) ignorait silencieusement tout au-delà de 128 tokens : une grande partie de chaque chunk était invisible pour la recherche, sans aucune erreur. Le projet est passé à `multilingual-e5-small` (512 tokens de contexte), avec des chunks de 400 tokens et 60 de chevauchement, **comptés avec le tokenizer du modèle d'embedding** lui-même.

Le découpage suit la structure du document : sections Markdown puis paragraphes ; frontières `class` / `def` pour le code Python ; entre deux lignes pour un tableur. Chaque chunk est préfixé par son **fil d'Ariane** (`[Group by > Aggregation]`), pour que l'embedding et le modèle sachent de quoi parle un extrait sorti de son contexte.

### Préserver le code

Le `MarkdownHeaderTextSplitter` de LangChain a été écarté après test : il supprimait l'indentation des blocs de code. Les loaders sont écrits maison (`pypdf`, `python-docx`, `python-pptx`, `openpyxl`, `beautifulsoup4`), avec une extraction HTML adaptée à Sphinx (menus et ancres supprimés, titres convertis, blocs `<pre>` conservés tels quels). Les tests vérifient explicitement que l'indentation survit du HTML jusqu'au chunk.

### Indexation idempotente

Chaque chunk a un identifiant déterministe (hash de la source et de la position). Réindexer un document supprime d'abord ses anciens chunks : pas de doublons, et un document raccourci ne laisse pas de fragments orphelins. Les préfixes `passage:` / `query:` qu'attend le modèle e5 sont appliqués automatiquement, à l'indexation comme à la recherche.

### Un prompt ancré et défensif

Le prompt de réponse impose de ne répondre qu'à partir des extraits, de citer chaque information par son numéro, de commencer par un exemple de code pour une question de syntaxe, et de répondre dans la langue de la question sans traduire les noms de fonctions. Le contenu documentaire est délimité par des balises et déclaré comme **donnée, jamais instruction** : une consigne cachée dans un document indexé est ignorée.

### Architecture en façade

L'interface Gradio ne parle qu'à une classe `RAGService` (`ingest`, `ask_stream`, `summarize`, `delete`). Remplacer Gradio par une API web ne toucherait aucun autre module. Les dépendances (base vectorielle, modèle, fonction de comptage) sont injectées, ce qui permet aux **39 tests** de tourner avec de faux embeddings et un faux LLM, sans clé ni téléchargement.

Le résumé d'un document n'utilise pas la recherche : un résumé concerne tout le document, donc tous ses chunks sont parcourus dans l'ordre de lecture, en map-reduce récursif avec appels parallèles.

## Résultats

- Hit rate@4 de **60 % à 97 %** sur le jeu d'évaluation, grâce à la réécriture de requête.
- Réponses sourcées, avec passages consultables, en français sur une documentation anglaise.
- 39 tests, exécutables hors ligne.

Les limites sont documentées : pas d'OCR pour les PDF scannés, ordre de lecture parfois mélangé sur les PDF multi-colonnes, et des scores de similarité e5 trop resserrés pour fixer un seuil de pertinence. Les pistes suivantes sont la recherche hybride BM25 + vecteurs pour les identifiants exacts, et le reranking par cross-encoder.

## Ce que j'ai appris

- **Un jeu d'évaluation vaut plus que n'importe quelle intuition.** La diversité MMR « semblait » une bonne idée ; les chiffres ont montré qu'à λ = 0,5 elle nuisait.
- **Les limites silencieuses sont les pires.** Un modèle qui tronque à 128 tokens sans erreur fausse toute la chaîne sans qu'on le voie. Il faut lire la fiche du modèle, puis vérifier.
- **Résoudre le problème au bon endroit.** Le fossé de langue aurait pu être attaqué par un meilleur modèle d'embedding, plus lourd. Une réécriture de requête, un appel court, l'a résolu presque entièrement.
- **Une abstraction maison bien testée peut battre une bibliothèque générique** quand cette dernière détruit une information essentielle, ici l'indentation du code.
