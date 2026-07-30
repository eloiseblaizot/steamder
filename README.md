# STEAMDER

> Vos relations, cataloguées. / Your relationships, catalogued.

Un site qui traite vos relations comme une bibliothèque Steam : vous en ajoutez une,
vous lui assignez un vrai jeu vidéo, vous la notez sur 100, vous écrivez l'évaluation.
Vos amis voient les vraies informations. Les autres ne voient que le jeu.

**C'est une parodie**, sans aucun lien avec Valve Corporation, Steam, Match Group ou Tinder.

---

## Démarrer

```bash
npm install
```

```bash
npm run dev
```

Le site tourne sur http://localhost:3000. La base démarre vide : créez votre compte
sur `/register`.

### Explorer avec du contenu

Pour peupler le site avec cinq comptes de démonstration et trente relations :

```bash
npm run db:seed
```

Mot de passe `steamder123` pour tous les comptes créés :

| Compte | Profil |
| --- | --- |
| `aurore` | 7 relations, note tout, amie de theo / jun / malik |
| `malik` | 5 relations, speedrunner, ami de ines / aurore |
| `jun` | 5 relations, longue durée, ami d'aurore |
| `theo` | 7 relations, pile de la honte, ami d'aurore / ines |
| `ines` | 6 relations, critique sévère, amie de malik / theo |

Connectez-vous en `aurore` puis ouvrez `/id/ines` : vous verrez la bibliothèque d'Inès
avec les vrais prénoms masqués, et une invitation en attente à accepter. Acceptez-la,
rechargez : les prénoms et les lieux apparaissent.

`npm run db:wipe` supprime la base pour repartir de zéro.

---

## Le modèle de visibilité

C'est le cœur du site. Chaque relation a deux jeux de champs :

| Privé — amis acceptés uniquement | Public — tout le monde |
| --- | --- |
| `real_name` | le jeu assigné (titre, jaquette, bannière) |
| `real_location` | `status`, `verdict`, `score` |
| `private_notes` | durée, heures de jeu, à distance ou non |
| | l'évaluation publique et les étiquettes |

La règle est appliquée à un seul endroit : `applyVisibility()` dans
[queries.ts](src/lib/queries.ts). Pour un non-ami, les colonnes privées sont
**absentes de l'objet**, pas vidées — le type `VisibleRelationship` est une union
discriminée sur `revealed`, donc un composant ne peut pas les afficher par accident,
TypeScript refuse de compiler.

Les succès sont calculés à partir des lignes brutes mais ne lisent que `tags` et
`review` (publics) pour les mots-clefs, et n'utilisent que des **compteurs** agrégés
des colonnes privées, jamais leurs valeurs — comme une liste de succès publique Steam.

---

## Fonctionnement

### Heures de jeu

Une relation « se joue ». La durée en jours devient des heures au compteur :
4,2 h par jour en présentiel, 1,6 h par jour à distance, 0 pour une liste de souhaits.
Deux ans deviennent donc ~3 000 heures, l'ordre de grandeur d'une vraie bibliothèque Steam.

### Statuts

`ongoing` (en cours) · `situationship` (accès anticipé) · `on_hold` (en pause) ·
`ended` (terminée) · `ghosted` (abandonnée) · `wishlist` (liste de souhaits)

### Succès

41 succès dans [achievements.ts](src/lib/achievements.ts), deux familles :

- **par mots-clefs** — un mot dans les étiquettes ou l'évaluation les déclenche :
  `travail` → *Bac à sable professionnel*, `toxique` → *Communauté toxique*,
  `thérapie` → *Notes de mise à jour*, `ex` → *Contenu historique*…
- **par jalons** — forme de la bibliothèque : *Speedrun* (moins de 30 jours),
  *Marathonien* (plus de 3 ans), *New Game Plus* (deux fois la même personne),
  *Remboursement demandé* (note sous 20), *Globe-trotter* (4 lieux différents)…

Le niveau du profil dérive d'une courbe d'XP alimentée par les heures, le nombre
de relations et les succès débloqués.

---

## Les jaquettes

Deux sources, avec repli automatique :

| Source | Ce qu'elle fournit | Clé requise |
| --- | --- | --- |
| **RAWG** | métadonnées, art paysage, captures, jeux console | `RAWG_API_KEY` |
| **CDN Steam** | jaquette portrait 600×900, bannière 1920×620 | aucune |
| **Généré** | SVG procédural, repli quand les deux échouent | aucune |

L'appid Steam est extrait de l'URL du store que RAWG renvoie. Chaque URL distante
est vérifiée par une requête `HEAD` au moment de l'enrichissement, donc le site
n'affiche jamais d'image cassée : ce qui n'est pas vérifié retombe sur le SVG.

Le SVG procédural n'est pas un pis-aller vide : huit familles de motifs (rayons,
orbites, éclats, ondes, grille, halos, scanlines, hexagones) choisies par un hash
du slug, avec les emblèmes du titre. Un jeu donné rend toujours la même image.

Pour reconstruire le catalogue :

```bash
npm run enrich -- --force
```

Options : `--only slug1,slug2` pour cibler quelques titres, sans `--force` pour ne
traiter que les entrées manquantes. Le script écrit
`src/lib/catalog.generated.json` par lots de 10, donc une interruption ne perd rien.

`.env.local` n'est lu **qu'au moment de l'enrichissement** — le site tourne sans clé.
Ce fichier est gitignoré.

### Une note sur les droits

Les visuels récupérés sont l'œuvre des éditeurs. Ils sont affichés depuis le CDN
d'origine (hotlink), pas recopiés sur ce serveur — c'est la pratique courante des
widgets Steam et de SteamDB. Si vous déployez publiquement, sachez que vous affichez
de l'œuvre tierce sous couvert de parodie et de citation.

---

## Les jeux ajoutés par les utilisateurs

Un titre manque au catalogue ? N'importe quel utilisateur peut l'ajouter depuis
`/library/games/new` en envoyant ses propres visuels. Le titre devient alors
disponible pour tout le monde, marqué d'une étoile dans le sélecteur et d'un badge
« Communauté » sur sa page.

Une seule image suffit : la bannière est recadrée automatiquement en 1920 × 620 et
460 × 215, et une jaquette portrait facultative fournit le 600 × 900. La palette de
la page est échantillonnée sur l'image envoyée, donc un titre communautaire se thème
exactement comme un titre officiel.

Les slugs sont préfixés `u-`, ce qui rend toute collision avec le catalogue
impossible. La résolution des deux catalogues passe par un point unique,
[catalog.ts](src/lib/catalog.ts).

### Ce que le pipeline d'upload garantit

L'upload accepte des fichiers arbitraires venant du navigateur, donc
[uploads.ts](src/lib/uploads.ts) part du principe que l'entrée est hostile :

- **Aucun SVG.** Ces fichiers sont servis depuis notre propre origine ; un SVG y est
  un vecteur d'exécution de script. Seuls JPEG, PNG, WebP et AVIF passent.
- **Rien n'est renvoyé tel quel.** Chaque image est décodée par sharp puis
  ré-encodée en WebP, ce qui élimine l'EXIF, les profils de couleur, les charges
  utiles en fin de fichier et les fichiers polyglottes. Le type MIME déclaré par le
  client n'est qu'un indice : c'est le contenu réel qui décide.
- **Plafond de pixels explicite**, pour qu'un petit fichier « bombe de
  décompression » ne puisse pas exploser en mémoire.
- **Les noms de fichiers sont générés depuis un slug validé**, jamais depuis le nom
  envoyé, et la route `/uploads` ne sert que des noms correspondant à ce motif — la
  traversée de chemin est impossible.
- **Un titre utilisé ne peut pas être supprimé**, pour ne jamais laisser une
  bibliothèque pointer vers un titre disparu.

Les fichiers vivent dans `data/uploads`, hors du répertoire public et gitignoré.
Le titre et les visuels sont **publics** : le formulaire le rappelle explicitement,
car y écrire un vrai prénom contournerait tout le modèle de visibilité.

---

## Le thème

L'interface reprend délibérément l'anatomie du client web Steam — en-tête à deux
niveaux, sous-navigation, capsules, boutons `btnv6`, page store en deux colonnes,
tableau de détails aligné à droite, cartes d'évaluation, barre d'onglets soulignée,
profil communautaire avec badge de niveau. Seule la teinte change : le bleu marine
de Steam est remappé sur la plage chaude `#9f1752` → `#401420`. La table de
correspondance couleur par couleur est en tête de [globals.css](src/app/globals.css).

Les pages de relation et de jeu sont teintées par la palette échantillonnée sur la
vraie jaquette, comme Steam accorde ses pages store à l'artwork.

---

## Structure

```
src/
  app/
    page.tsx                    boutique
    library/                    bibliothèque, ajout, édition
    app/[id]/                   page d'une relation (page store)
    game/[slug]/                page d'un jeu (agrégat de tous les joueurs)
    id/[handle]/                profil, bibliothèque publique, succès
    library/games/              jeux soumis : ajout, édition, gestion
    community/  friends/        annuaire, invitations
    settings/                   personnalisation du profil
    art/[kind]/[id]/            route d'images SVG procédurales
    uploads/[name]/             route servant les visuels envoyés
    actions.ts                  toutes les mutations (server actions)
  lib/
    db.ts  queries.ts           SQLite + la règle de visibilité
    auth.ts  session.ts         scrypt, sessions par cookie
    catalog.ts                  résolveur unique : catalogue + soumissions
    games.ts                    catalogue de 200 titres
    customGames.ts              titres soumis par les utilisateurs
    uploads.ts  palette.ts      pipeline d'upload, échantillonnage couleur
    assets.ts                   résolution art réel → procédural
    art.ts                      générateur SVG
    achievements.ts  stats.ts   succès, heures, niveaux
    i18n.ts  lang.ts            FR / EN
scripts/
  seed.ts  enrich.ts
```

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | build de production |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:seed` | ajoute les comptes de démo manquants |
| `npm run db:reset` | vide les tables puis réinsère |
| `npm run db:wipe` | supprime la base (repart de zéro) |
| `npm run enrich` | reconstruit le catalogue depuis RAWG + Steam |

## Pile

Next.js 15 (App Router, server actions) · React 19 · TypeScript strict ·
Tailwind 4 + CSS maison · SQLite via `better-sqlite3` · mots de passe scrypt.
Traitement d'images par `sharp`. La base vit dans `data/steamder.db` et les visuels
envoyés dans `data/uploads` (les deux gitignorés) ; `STEAMDER_DB` et
`STEAMDER_UPLOADS` permettent de les déplacer.
