/**
 * Seed STEAMDER with demo players, relationships and friendships.
 *
 * Run with:  npm run db:seed        (inserts, keeping any existing data)
 *            npm run db:reset       (wipes the tables first)
 *
 * Every demo account uses the password `steamder123`.
 */

import { db, nowIso } from '../src/lib/db.ts';
import { hashPassword } from '../src/lib/auth.ts';
import type { Status, Verdict } from '../src/lib/types.ts';

const PASSWORD = 'steamder123';
const RESET = process.argv.includes('--reset');

interface SeedRel {
  name: string;
  location: string;
  game: string;
  status: Status;
  verdict: Verdict;
  score: number;
  ld: boolean;
  from: string;
  to: string | null;
  review: string;
  notes: string;
  tags: string;
}

interface SeedUser {
  handle: string;
  display: string;
  bio: string;
  country: string;
  theme: string;
  frame: string;
  showcase: string;
  rels: SeedRel[];
}

const USERS: SeedUser[] = [
  {
    handle: 'aurore',
    display: 'Aurore',
    bio: "Je note tout. Oui, même toi. Complétiste sur les relations courtes, abandonne toujours les campagnes trop longues.",
    country: 'France',
    theme: 'crimson',
    frame: 'flame',
    showcase: 'stats',
    rels: [
      {
        name: 'Théo',
        location: 'Bourges',
        game: 'stardew-valley',
        status: 'ended',
        verdict: 'recommended',
        score: 88,
        ld: false,
        from: '2019-04-12',
        to: '2021-09-30',
        review:
          "Boucle de gameplay extrêmement confortable. On s'installe, on arrose les plantes, on discute au bar le vendredi. Le contenu de fin de partie manque un peu d'ambition et j'ai fini par tourner en rond, mais les 800 premières heures sont excellentes. Recommandé si vous cherchez quelque chose de calme.",
        notes: "Rencontré au boulot. Toujours en bons termes, il m'envoie des photos de son chat.",
        tags: 'cosy,calme,travail,première',
      },
      {
        name: 'Naïm',
        location: 'Lyon',
        game: 'apex-legends',
        status: 'ghosted',
        verdict: 'not_recommended',
        score: 34,
        ld: true,
        from: '2022-02-01',
        to: '2022-03-18',
        review:
          "Démarrage nerveux, très intense, puis serveurs indisponibles sans prévenir. Beaucoup de promesses dans le tutoriel, peu de suivi. La communication passe uniquement par un chat vocal qu'il coupe dès qu'un sujet devient sérieux. Abandonné en cours de saison.",
        notes: 'Ghosté du jour au lendemain. Vu en story trois semaines plus tard à Barcelone.',
        tags: 'toxique,rapide,intense,online',
      },
      {
        name: 'Salomé',
        location: 'Bourges',
        game: 'portal-2',
        status: 'ended',
        verdict: 'recommended',
        score: 95,
        ld: false,
        from: '2022-06-04',
        to: '2023-01-15',
        review:
          "Court, brillant, parfaitement écrit. Chaque conversation avait l'air d'avoir été relue. Le seul défaut est la durée de vie : on arrive au générique bien trop vite et il n'y a pas de contenu additionnel. Je la relancerais volontiers.",
        notes: 'Partie en thèse à Montréal. On s’écrit encore.',
        tags: 'brillant,court,fac,doux',
      },
      {
        name: 'Erwan',
        location: 'Nantes',
        game: 'euro-truck-simulator-2',
        status: 'on_hold',
        verdict: 'recommended',
        score: 62,
        ld: true,
        from: '2024-03-22',
        to: null,
        review:
          "Beaucoup de trajet pour peu d'arrivée. C'est reposant, on met un podcast et les kilomètres passent, mais il ne se passe jamais vraiment rien. Mis en pause le temps de voir si une mise à jour arrive.",
        notes: '400 km. On se voit un week-end sur trois. Ça s’essouffle.',
        tags: 'distance,lent,calme',
      },
      {
        name: 'Camille',
        location: 'Paris',
        game: 'doki-doki-literature-club',
        status: 'ended',
        verdict: 'not_recommended',
        score: 18,
        ld: false,
        from: '2023-05-02',
        to: '2023-08-11',
        review:
          "Les trois premières semaines sont charmantes. Puis le jeu révèle ce qu'il est vraiment et il n'y a pas de bouton pour revenir en arrière. Manipulation, gaslighting, et un final que je n'avais pas vu venir. Remboursement demandé.",
        notes: 'Thérapie depuis. Ça va beaucoup mieux.',
        tags: 'toxique,manipulation,thérapie',
      },
      {
        name: 'Jun',
        location: 'Tokyo',
        game: 'journey',
        status: 'ongoing',
        verdict: 'recommended',
        score: 100,
        ld: true,
        from: '2025-01-18',
        to: null,
        review:
          "On ne parle pas la même langue et pourtant tout est clair. Aucune interface, aucun tutoriel, on avance ensemble. C'est la première fois que je mets 100 à quelque chose et j'assume complètement. Passionnel, un peu effrayant.",
        notes: 'Rencontré en Erasmus. 9 700 km. On alterne les visites tous les quatre mois.',
        tags: 'distance,passionnel,voyage,online',
      },
      {
        name: 'Basile',
        location: '',
        game: 'no-mans-sky',
        status: 'wishlist',
        verdict: 'recommended',
        score: 55,
        ld: false,
        from: '2025-11-02',
        to: null,
        review:
          "Sur la liste depuis un moment. Beaucoup de promesses, un lancement raté chez d'autres joueurs, mais il paraît que ça s'est arrangé. Je verrai.",
        notes: 'Collègue de Théo. On s’est croisés deux fois.',
        tags: 'travail,attente',
      },
    ],
  },
  {
    handle: 'malik',
    display: 'Malik',
    bio: 'Speedrunner. Meilleur temps : 11 jours. Je ne joue pas aux jeux longs, la vie est courte.',
    country: 'Belgique',
    theme: 'ember',
    frame: 'gold',
    showcase: 'achievements',
    rels: [
      {
        name: 'Inès',
        location: 'Bruxelles',
        game: 'hades',
        status: 'ended',
        verdict: 'recommended',
        score: 91,
        ld: false,
        from: '2023-09-05',
        to: '2024-02-20',
        review:
          "Excellent rythme, dialogue toujours pertinent, et une vraie progression entre chaque tentative. On recommence volontiers. La fin arrive quand on a compris comment ça marche, et c'est peut-être ça le problème.",
        notes: 'Toujours amis. Elle est sur STEAMDER aussi.',
        tags: 'intense,rapide,amitié',
      },
      {
        name: 'Léa',
        location: 'Bruxelles',
        game: 'getting-over-it',
        status: 'ghosted',
        verdict: 'not_recommended',
        score: 12,
        ld: false,
        from: '2024-04-01',
        to: '2024-04-09',
        review:
          "Huit jours. Chaque conversation ramenait au point de départ. Le jeu commente lui-même votre échec pendant que vous glissez. Contenu philosophique intéressant, expérience désagréable.",
        notes: 'Aucun regret.',
        tags: 'rapide,dispute,toxique',
      },
      {
        name: 'Sofiane',
        location: 'Anvers',
        game: 'titanfall-2',
        status: 'ended',
        verdict: 'recommended',
        score: 84,
        ld: false,
        from: '2022-11-11',
        to: '2023-03-04',
        review:
          "Largement sous-estimé. Mobilité irréprochable, campagne courte mais sans temps mort. Personne n'en parle et c'est dommage. Sorti au mauvais moment, comme souvent.",
        notes: 'Déménagé à Berlin pour le boulot.',
        tags: 'sous-estimé,rapide,travail',
      },
      {
        name: 'Yara',
        location: 'Gand',
        game: 'balatro',
        status: 'situationship',
        verdict: 'recommended',
        score: 79,
        ld: false,
        from: '2025-06-14',
        to: null,
        review:
          "Une partie de plus. Toujours une partie de plus. Je devrais m'arrêter mais le système est trop bien conçu pour ça. Accès anticipé assumé : on verra bien la version 1.0.",
        notes: 'On ne met pas de mot dessus. Ça marche comme ça.',
        tags: 'addictif,rapide,online',
      },
      {
        name: 'Inès',
        location: 'Bruxelles',
        game: 'hades-2',
        status: 'ongoing',
        verdict: 'recommended',
        score: 87,
        ld: false,
        from: '2025-09-01',
        to: null,
        review:
          "New Game Plus. Même studio, même qualité d'écriture, deux ans de plus au compteur des deux côtés. Certaines mécaniques ont changé, en mieux.",
        notes: 'Oui, la même. Deuxième run.',
        tags: 'intense,thérapie,doux',
      },
    ],
  },
  {
    handle: 'jun',
    display: 'Jun',
    bio: 'Longue durée uniquement. Je finis ce que je commence. 100% de complétion sur trois titres.',
    country: 'Japon',
    theme: 'velvet',
    frame: 'verified',
    showcase: 'top_rated',
    rels: [
      {
        name: 'Aurore',
        location: 'Bourges',
        game: 'journey',
        status: 'ongoing',
        verdict: 'recommended',
        score: 98,
        ld: true,
        from: '2025-01-18',
        to: null,
        review:
          "Aucune langue commune au départ, et pourtant la communication n'a jamais été un problème. Onze mille kilomètres, des fuseaux horaires incompatibles, et malgré tout la meilleure chose de ces dernières années.",
        notes: 'Elle a mis 100. J’ai mis 98 pour garder de la marge.',
        tags: 'distance,voyage,passionnel',
      },
      {
        name: 'Hiro',
        location: 'Osaka',
        game: 'final-fantasy-xiv',
        status: 'ended',
        verdict: 'recommended',
        score: 76,
        ld: true,
        from: '2018-07-01',
        to: '2023-04-15',
        review:
          "Presque cinq ans. Excellent contenu de milieu de partie, communauté agréable, mais un essoufflement net sur la dernière extension. On a fini par se connecter par habitude plutôt que par envie.",
        notes: 'Séparation calme. On se voit encore aux anniversaires.',
        tags: 'distance,long,calme,amitié',
      },
      {
        name: 'Mei',
        location: 'Tokyo',
        game: 'katamari-damacy',
        status: 'ended',
        verdict: 'recommended',
        score: 81,
        ld: false,
        from: '2016-03-20',
        to: '2018-01-08',
        review:
          "Absurde du début à la fin, et la bande-son ne quitte plus la tête. On accumule les choses sans trop savoir pourquoi et un jour la boule est trop grosse.",
        notes: 'Première vraie relation. Beaucoup appris.',
        tags: 'première,absurde,fac',
      },
      {
        name: 'Ren',
        location: 'Kyoto',
        game: 'silent-hill-2',
        status: 'ghosted',
        verdict: 'not_recommended',
        score: 28,
        ld: false,
        from: '2023-10-02',
        to: '2024-01-11',
        review:
          "Atmosphère lourde, brouillard permanent, et une culpabilité que le jeu vous renvoie à chaque pièce. Techniquement remarquable. Je ne le recommanderais à personne dans cet état.",
        notes: 'Période difficile pour nous deux. Pas de rancune.',
        tags: 'lourd,dispute,thérapie',
      },
      {
        name: 'Sora',
        location: 'Sapporo',
        game: 'spiritfarer',
        status: 'ended',
        verdict: 'recommended',
        score: 93,
        ld: true,
        from: '2013-05-05',
        to: '2016-02-14',
        review:
          "On savait dès le début comment ça finirait. Le jeu consiste à accompagner, pas à gagner. Doux, lent, et beaucoup plus dur que prévu sur la fin.",
        notes: 'Elle est partie en 2016. Je garde ce titre en vitrine.',
        tags: 'distance,doux,long',
      },
    ],
  },
  {
    handle: 'theo',
    display: 'Théo',
    bio: 'Pile de la honte assumée. J’ajoute plus vite que je ne joue.',
    country: 'France',
    theme: 'obsidian',
    frame: 'none',
    showcase: 'worst_rated',
    rels: [
      {
        name: 'Aurore',
        location: 'Bourges',
        game: 'stardew-valley',
        status: 'ended',
        verdict: 'recommended',
        score: 84,
        ld: false,
        from: '2019-04-12',
        to: '2021-09-30',
        review:
          "Deux ans et demi de routine agréable. Beaucoup de petits gestes quotidiens, très peu d'événements marquants. C'est un compliment et c'est aussi la raison pour laquelle ça s'est arrêté.",
        notes: 'On travaillait ensemble. Elle note tout, y compris ça.',
        tags: 'cosy,travail,calme,long',
      },
      {
        name: 'Manon',
        location: 'Tours',
        game: 'among-us',
        status: 'ghosted',
        verdict: 'not_recommended',
        score: 22,
        ld: true,
        from: '2022-01-15',
        to: '2022-05-30',
        review:
          "Le jeu repose entièrement sur le fait de mentir avec assurance. Très bien conçu pour ça. Impossible de savoir ce qui était vrai. Fin de partie sans annonce.",
        notes: 'Deux autres personnes en parallèle. Je l’ai appris après.',
        tags: 'toxique,distance,dispute',
      },
      {
        name: 'Louis',
        location: 'Bourges',
        game: 'a-way-out',
        status: 'ended',
        verdict: 'recommended',
        score: 71,
        ld: false,
        from: '2023-02-08',
        to: '2023-11-22',
        review:
          "Impossible à jouer seul, et c'est tout l'intérêt. Bonne coordination, quelques passages laborieux, et une dernière heure qui recontextualise tout le reste.",
        notes: 'Toujours un bon ami.',
        tags: 'amitié,doux',
      },
      {
        name: 'Sarah',
        location: 'Orléans',
        game: 'star-citizen',
        status: 'situationship',
        verdict: 'not_recommended',
        score: 41,
        ld: true,
        from: '2024-09-12',
        to: null,
        review:
          "Beaucoup d'annonces, très peu de livraisons. On en parle depuis plus d'un an et le contenu reste à l'état de promesse. Techniquement en accès anticipé depuis le début.",
        notes: 'On verra. Pas d’illusions.',
        tags: 'distance,attente,lent',
      },
      {
        name: 'Nour',
        location: 'Bourges',
        game: 'unpacking',
        status: 'ongoing',
        verdict: 'recommended',
        score: 89,
        ld: false,
        from: '2025-04-03',
        to: null,
        review:
          "Aucun dialogue, et pourtant tout est dit. On installe ses affaires dans le même espace et on comprend petit à petit à qui on a affaire. Très doux.",
        notes: 'Emménagement prévu au printemps.',
        tags: 'doux,cosy,calme',
      },
      {
        name: 'Kevin',
        location: '',
        game: 'dark-souls-3',
        status: 'wishlist',
        verdict: 'recommended',
        score: 50,
        ld: false,
        from: '2025-12-01',
        to: null,
        review: '',
        notes: 'Ami d’ami. Rien de concret pour l’instant.',
        tags: 'amitié,attente',
      },
      {
        name: 'Elsa',
        location: 'Blois',
        game: 'firewatch',
        status: 'ended',
        verdict: 'recommended',
        score: 68,
        ld: true,
        from: '2021-06-20',
        to: '2021-12-02',
        review:
          "Excellente écriture, très bonne ambiance, et une conclusion qui laisse volontairement sur sa faim. Beaucoup de conversations à distance et pas assez de présence.",
        notes: 'Été 2021. Bon souvenir malgré tout.',
        tags: 'distance,vacances,été',
      },
    ],
  },
  {
    handle: 'ines',
    display: 'Inès',
    bio: 'Critique sévère mais juste. Si vous avez plus de 80 chez moi, c’est mérité.',
    country: 'Belgique',
    theme: 'rose',
    frame: 'shattered',
    showcase: 'stats',
    rels: [
      {
        name: 'Malik',
        location: 'Bruxelles',
        game: 'hades',
        status: 'ended',
        verdict: 'recommended',
        score: 86,
        ld: false,
        from: '2023-09-05',
        to: '2024-02-20',
        review:
          "Très bon rythme, beaucoup d'énergie, et une vraie capacité à recommencer après une mauvaise soirée. Cinq mois, ce qui est long pour lui.",
        notes: 'On a recommencé en septembre. Voir l’autre entrée.',
        tags: 'intense,rapide,amitié',
      },
      {
        name: 'Malik',
        location: 'Bruxelles',
        game: 'hades-2',
        status: 'ongoing',
        verdict: 'recommended',
        score: 90,
        ld: false,
        from: '2025-09-01',
        to: null,
        review:
          "Deuxième run, meilleure version. Les mécaniques qui posaient problème la première fois ont été revues. Rare qu'une suite améliore réellement l'original.",
        notes: 'New Game Plus, littéralement.',
        tags: 'intense,thérapie,doux',
      },
      {
        name: 'Fanny',
        location: 'Liège',
        game: 'papers-please',
        status: 'ended',
        verdict: 'not_recommended',
        score: 38,
        ld: false,
        from: '2022-03-01',
        to: '2022-10-14',
        review:
          "Beaucoup de règles, beaucoup de vérifications, et une charge administrative permanente. Chaque décision se paie. Mécaniquement irréprochable, épuisant à vivre.",
        notes: 'Très contrôlante. Sept mois de trop.',
        tags: 'toxique,contrôle,dispute',
      },
      {
        name: 'Dorian',
        location: 'Namur',
        game: 'outer-wilds',
        status: 'ended',
        verdict: 'recommended',
        score: 94,
        ld: false,
        from: '2024-05-20',
        to: '2025-03-08',
        review:
          "On ne peut le vivre qu'une fois, et c'est exactement ce qui le rend précieux. Aucune progression matérielle, uniquement de la compréhension. Je ne changerais rien.",
        notes: 'Séparation d’un commun accord. Rare et précieux.',
        tags: 'doux,brillant,calme',
      },
      {
        name: 'Anaïs',
        location: 'Bruxelles',
        game: 'lethal-company',
        status: 'ghosted',
        verdict: 'not_recommended',
        score: 31,
        ld: false,
        from: '2025-01-05',
        to: '2025-02-16',
        review:
          "Chat de proximité uniquement : dès qu'on s'éloigne, plus aucune information. Beaucoup de cris, un quota impossible à atteindre, six semaines.",
        notes: 'Six semaines. Un record dans le mauvais sens.',
        tags: 'toxique,rapide,dispute',
      },
      {
        name: 'Gaëlle',
        location: 'Bruges',
        game: 'coffee-talk',
        status: 'situationship',
        verdict: 'recommended',
        score: 74,
        ld: true,
        from: '2025-08-11',
        to: null,
        review:
          "Beaucoup d'écoute, peu d'enjeu. On se voit, on parle, chacun repart. Très reposant, sans direction claire pour l'instant.",
        notes: 'On verra où ça va. Aucune urgence.',
        tags: 'calme,doux,distance,online',
      },
    ],
  },
];

/** Accepted friendships, plus a couple of pending invites to show the flow. */
const FRIENDSHIPS: [string, string, 'accepted' | 'pending'][] = [
  ['aurore', 'theo', 'accepted'],
  ['aurore', 'jun', 'accepted'],
  ['malik', 'ines', 'accepted'],
  ['aurore', 'malik', 'accepted'],
  ['theo', 'ines', 'accepted'],
  ['jun', 'malik', 'pending'],
  ['ines', 'aurore', 'pending'],
];

function main(): void {
  const conn = db();

  if (RESET) {
    conn.exec(`DELETE FROM sessions; DELETE FROM friendships; DELETE FROM relationships; DELETE FROM users;`);
    console.log('· cleared existing data');
  }

  const now = nowIso();
  const hash = hashPassword(PASSWORD);
  const ids = new Map<string, number>();

  const insertUser = conn.prepare(
    `INSERT INTO users (handle, display_name, password_hash, bio, real_country, avatar_seed,
                        avatar_frame, theme, showcase, created_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const insertRel = conn.prepare(
    `INSERT INTO relationships
     (user_id, real_name, real_location, private_notes, game_slug, status, verdict, score,
      long_distance, started_on, ended_on, review, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const insertFriendship = conn.prepare(
    `INSERT OR IGNORE INTO friendships (requester_id, addressee_id, status, created_at, responded_at)
     VALUES (?, ?, ?, ?, ?)`,
  );

  const seed = conn.transaction(() => {
    for (const u of USERS) {
      const existing = conn.prepare(`SELECT id FROM users WHERE handle = ?`).get(u.handle) as
        | { id: number }
        | undefined;
      if (existing) {
        ids.set(u.handle, existing.id);
        console.log(`· user ${u.handle} already exists, skipping`);
        continue;
      }

      const info = insertUser.run(
        u.handle,
        u.display,
        hash,
        u.bio,
        u.country,
        `${u.handle}-seed-avatar`,
        u.frame,
        u.theme,
        u.showcase,
        now,
        now,
      );
      const userId = Number(info.lastInsertRowid);
      ids.set(u.handle, userId);

      let featured: number | null = null;
      let bestScore = -1;

      for (const r of u.rels) {
        const relInfo = insertRel.run(
          userId,
          r.name,
          r.location,
          r.notes,
          r.game,
          r.status,
          r.verdict,
          r.score,
          r.ld ? 1 : 0,
          r.from,
          r.to,
          r.review,
          r.tags,
          now,
          now,
        );
        if (r.score > bestScore && r.status !== 'wishlist') {
          bestScore = r.score;
          featured = Number(relInfo.lastInsertRowid);
        }
      }

      if (featured !== null) {
        conn.prepare(`UPDATE users SET featured_relationship_id = ? WHERE id = ?`).run(featured, userId);
      }

      console.log(`✓ ${u.handle} — ${u.rels.length} relationships`);
    }

    for (const [a, b, status] of FRIENDSHIPS) {
      const idA = ids.get(a);
      const idB = ids.get(b);
      if (idA === undefined || idB === undefined || idA === idB) continue;
      insertFriendship.run(idA, idB, status, now, status === 'accepted' ? now : null);
    }
    console.log(`✓ ${FRIENDSHIPS.length} friendship rows`);
  });

  seed();

  const counts = conn
    .prepare(
      `SELECT (SELECT COUNT(*) FROM users) AS users,
              (SELECT COUNT(*) FROM relationships) AS rels,
              (SELECT COUNT(*) FROM friendships WHERE status = 'accepted') AS friends`,
    )
    .get() as { users: number; rels: number; friends: number };

  console.log(
    `\nSeed complete: ${counts.users} players, ${counts.rels} relationships, ${counts.friends} friendships.`,
  );
  console.log(`Sign in with any handle above and the password "${PASSWORD}".`);
}

main();
