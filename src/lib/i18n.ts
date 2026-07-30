export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_COOKIE = 'steamder_lang';
export const DEFAULT_LANG: Lang = 'fr';

/**
 * Flat string table. English is the source of truth for the key union, so a
 * missing French key is a type error rather than a silent fallback.
 */
const EN = {
  /* ---- brand / chrome ---- */
  tagline: 'Your relationships, catalogued.',
  nav_store: 'Store',
  nav_library: 'Library',
  nav_community: 'Community',
  nav_profile: 'Profile',
  nav_friends: 'Friends',
  nav_settings: 'Settings',
  nav_login: 'Login',
  nav_register: 'Sign up',
  nav_logout: 'Log out',
  nav_add: 'Add a relationship',
  search_placeholder: 'search',
  search_users_placeholder: 'search users',
  install_steamder: 'Install STEAMDER',
  lang_switch: 'Language',

  /* ---- store front ---- */
  store_featured: 'Featured & Recommended',
  store_trending: 'Trending among your peers',
  store_recent_reviews: 'Recent reviews',
  store_top_rated: 'Top rated this season',
  store_new_arrivals: 'New arrivals',
  store_browse_all: 'Browse all',
  store_special_offer: 'Special offer',
  store_hero_title: 'Everyone you have ever dated. Reviewed.',
  store_hero_body:
    'Add a relationship to your library, assign it a game, rate it out of 100, and let your friends read the review. They only see the real name if you have accepted them.',
  store_cta_start: 'Start your library',
  store_cta_browse: 'Browse the community',
  store_players_now: '{n} in a relationship right now',
  store_stat_relationships: 'relationships catalogued',
  store_stat_players: 'registered players',
  store_stat_hours: 'hours logged',
  store_stat_games: 'titles in the catalogue',

  /* ---- library ---- */
  lib_title: 'Library',
  lib_all: 'All',
  lib_search: 'Search your library',
  lib_installed: 'Currently playing',
  lib_uninstalled: 'No longer installed',
  lib_wishlist: 'Wishlist',
  lib_count: '{n} in library',
  lib_empty_title: 'Your library is empty',
  lib_empty_body: 'Add your first relationship to start building a catalogue.',
  lib_last_played: 'Last played',
  lib_hours_total: '{n} hrs on record',
  lib_play: 'Play',
  lib_replay: 'Replay',
  lib_install: 'Install',
  lib_uninstalled_btn: 'Uninstalled',
  lib_sort: 'Sort by',
  sort_recent: 'Most recent',
  sort_hours: 'Hours played',
  sort_score: 'Score',
  sort_name: 'Title',

  /* ---- relationship fields ---- */
  f_real_name: 'Real name',
  f_real_location: 'Location',
  f_game: 'Assigned game',
  f_status: 'Status',
  f_verdict: 'Verdict',
  f_score: 'Score',
  f_long_distance: 'Long distance',
  f_started: 'Started on',
  f_ended: 'Ended on',
  f_review: 'Public review',
  f_notes: 'Private notes',
  f_tags: 'Tags',
  f_duration: 'Duration',
  f_hours: 'Hours played',

  /* ---- statuses ---- */
  st_ongoing: 'Currently playing',
  st_situationship: 'Early Access',
  st_on_hold: 'On hold',
  st_ended: 'Completed',
  st_ghosted: 'Abandoned',
  st_wishlist: 'On the wishlist',

  /* ---- verdicts ---- */
  v_recommended: 'Recommended',
  v_not_recommended: 'Not Recommended',

  /* ---- add / edit ---- */
  add_title: 'Add a relationship to your library',
  add_intro:
    'Private fields are only shown to friends you have accepted. Everything else is public.',
  add_submit: 'Add to library',
  edit_title: 'Edit relationship',
  edit_submit: 'Save changes',
  edit_delete: 'Remove from library',
  edit_delete_confirm: 'Remove this relationship from your library? This cannot be undone.',
  section_private: 'Private — friends only',
  section_public: 'Public — visible to everyone',
  pick_game: 'Pick a game',
  pick_game_hint:
    'The game defines the cover art, the banner and the colour scheme of the page. Non-friends see only this title.',
  game_search_placeholder: 'Search the catalogue…',
  score_hint: '0 to 100, like a review score.',
  tags_hint: 'Comma-separated. Tags feed your achievements.',
  ongoing_hint: 'Leave the end date empty if it is still going.',

  /* ---- relationship page ---- */
  app_all_reviews: 'All reviews',
  app_about: 'About this relationship',
  app_details: 'Details',
  app_developer: 'Developer',
  app_publisher: 'Publisher',
  app_release_date: 'Release date',
  app_genre: 'Genre',
  app_players: 'Players',
  app_single: 'Single player',
  app_coop: 'Co-op',
  app_languages: 'Languages',
  app_screenshots: 'Screenshots',
  app_your_review: 'Your review',
  app_no_review: 'No review written.',
  app_reviewed_by: 'Reviewed by',
  app_hidden_name: 'Name hidden',
  app_hidden_location: 'Location hidden',
  app_locked_title: 'Friends-only content',
  app_locked_body:
    'Add {name} as a friend to see the real name, the location and the private notes for this relationship.',
  app_locked_short: 'Friends only',
  app_owned_by: 'In the library of',
  app_edit: 'Edit',
  app_other_players: 'Others who played this title',
  app_no_other_players: 'Nobody else has this title in their library.',
  app_playtime_forecast: 'Estimated playtime',
  app_still_running: 'still running',
  app_price_free: 'Free to play',
  app_price_costly: 'Emotionally expensive',
  app_metacritic: 'STEAMDER score',
  app_tags: 'Tags',
  app_dlc: 'Downloadable content',

  /* ---- profile ---- */
  prof_level: 'Level',
  prof_online: 'Online',
  prof_offline: 'Last seen {when}',
  prof_relationships: 'Relationships',
  prof_friends: 'Friends',
  prof_achievements: 'Achievements',
  prof_hours: 'Hours',
  prof_showcase: 'Showcase',
  prof_recent_activity: 'Recent activity',
  prof_stats: 'Statistics',
  prof_no_bio: 'No information given.',
  prof_add_friend: 'Add friend',
  prof_pending: 'Invite sent',
  prof_accept: 'Accept invite',
  prof_remove_friend: 'Remove friend',
  prof_is_friend: 'Friends',
  prof_edit: 'Edit profile',
  prof_login_to_add: 'Log in to add friends',
  prof_private_note: 'You see real names because you are friends.',
  prof_public_note: 'You are not friends, so real names and locations are hidden.',
  prof_favourite: 'Favourite title',
  prof_avg_score: 'Average score',
  prof_avg_hours: 'Average hours per relationship',
  prof_longest: 'Longest playthrough',
  prof_shortest: 'Shortest playthrough',
  prof_completion: 'Completion rate',
  prof_ld_share: 'Long distance',
  prof_by_status: 'By status',
  prof_by_genre: 'By genre',
  prof_perfect_games: 'Perfect games',
  prof_refunded: 'Refunded',

  /* ---- friends / community ---- */
  com_title: 'Community',
  com_players: 'Players',
  com_find: 'Find players',
  com_no_results: 'No player matches that search.',
  fr_title: 'Friends',
  fr_incoming: 'Pending invites',
  fr_outgoing: 'Sent invites',
  fr_yours: 'Your friends',
  fr_none: 'You have no friends yet. That is what the community tab is for.',
  fr_none_incoming: 'No pending invites.',
  fr_none_outgoing: 'No sent invites.',
  fr_accept: 'Accept',
  fr_decline: 'Decline',
  fr_cancel: 'Cancel invite',
  fr_shared: '{n} relationships visible to you',

  /* ---- settings ---- */
  set_title: 'Profile settings',
  set_display_name: 'Display name',
  set_handle: 'Custom URL',
  set_bio: 'Summary',
  set_country: 'Country',
  set_theme: 'Profile theme',
  set_frame: 'Avatar frame',
  set_showcase: 'Featured showcase',
  set_avatar: 'Avatar',
  set_avatar_reroll: 'Generate a new avatar',
  set_featured: 'Featured relationship',
  set_featured_none: 'None',
  set_save: 'Save',
  set_saved: 'Settings saved.',
  set_lang: 'Interface language',

  /* ---- themes / frames ---- */
  th_crimson: 'Crimson',
  th_ember: 'Ember',
  th_velvet: 'Velvet',
  th_obsidian: 'Obsidian',
  th_rose: 'Rose',
  fr_none_frame: 'No frame',
  fr_gold: 'Gold',
  fr_flame: 'Flame',
  fr_shattered: 'Shattered',
  fr_verified: 'Verified',
  sc_stats: 'Statistics',
  sc_achievements: 'Achievements',
  sc_top_rated: 'Best rated',
  sc_worst_rated: 'Worst rated',

  /* ---- auth ---- */
  auth_login_title: 'Sign in to STEAMDER',
  auth_register_title: 'Create your STEAMDER account',
  auth_handle: 'Account name',
  auth_password: 'Password',
  auth_password_confirm: 'Confirm password',
  auth_display_name: 'Display name',
  auth_submit_login: 'Sign in',
  auth_submit_register: 'Create account',
  auth_no_account: 'No account?',
  auth_have_account: 'Already registered?',
  auth_handle_hint: '3 to 24 characters: letters, digits, - and _.',
  auth_password_hint: 'At least 8 characters.',
  auth_err_credentials: 'Wrong account name or password.',
  auth_err_handle_taken: 'That account name is taken.',
  auth_err_handle_invalid: 'Account name must be 3 to 24 characters: letters, digits, - or _.',
  auth_err_password_short: 'Password must be at least 8 characters.',
  auth_err_password_mismatch: 'The two passwords do not match.',
  auth_err_name_required: 'Pick a display name.',
  auth_login_required: 'You need to be signed in for that.',
  auth_demo_hint: 'Demo accounts: {accounts} — password {password}',

  /* ---- generic ---- */
  g_cancel: 'Cancel',
  g_back: 'Back',
  g_yes: 'Yes',
  g_no: 'No',
  g_none: 'None',
  g_unknown: 'Unknown',
  g_days: '{n} days',
  g_months: '{n} months',
  g_years: '{n} years',
  g_hours: '{n} hrs',
  g_and_more: 'and {n} more',
  g_of: 'of',
  g_view_all: 'View all',
  g_not_found: 'Not found',
  g_not_found_body: 'That page does not exist, or it was uninstalled.',
  g_error: 'Something went wrong',
  g_required: 'This field is required.',

  /* ---- user-submitted games ---- */
  cg_add_title: 'Add a game to the catalogue',
  cg_edit_title: 'Edit your game',
  cg_intro:
    'Missing a title? Add it yourself. Everyone can then assign it to a relationship, and the artwork you upload becomes its capsule, banner and page colours.',
  cg_privacy:
    'The title and its artwork are public, and shown to people who are not your friends. Do not put a real name in there — that is what the private fields on a relationship are for.',
  cg_name: 'Game title',
  cg_year: 'Release year',
  cg_year_hint: 'Optional.',
  cg_genre: 'Genre',
  cg_tags: 'Tags',
  cg_tags_hint: 'Comma-separated, up to 8. Shown on the game page.',
  cg_banner: 'Banner image',
  cg_banner_hint:
    'Used for the wide banner and the list thumbnail. JPEG, PNG, WebP or AVIF, up to {mb} MB. Cropped to 1920 × 620 and 460 × 215.',
  cg_cover: 'Portrait cover',
  cg_cover_hint:
    'Optional. Cropped to 600 × 900 for the library capsule. Without it, the banner is cropped instead.',
  cg_replace_art: 'Replace the artwork',
  cg_replace_art_hint: 'Leave empty to keep the current images.',
  cg_submit: 'Add the game',
  cg_save: 'Save the game',
  cg_saved: 'Game saved.',
  cg_mine: 'Your games',
  cg_mine_none: 'You have not added any game yet.',
  cg_manage: 'Manage your games',
  cg_badge: 'Community',
  cg_by: 'Added by',
  cg_used_by: 'Used by {n}',
  cg_unused: 'Not used yet',
  cg_delete: 'Delete',
  cg_delete_confirm: 'Delete this game from the catalogue? The artwork is deleted too.',
  cg_delete_blocked:
    'This game cannot be deleted while relationships still point at it.',
  cg_edit: 'Edit',
  cg_add_link: 'Not in the list?',
  cg_add_cta: 'Add a game',
  cg_count: '{n} / {max} games added',
  cg_err_title: 'Give the game a title.',
  cg_err_banner: 'A banner image is required.',
  cg_err_limit: 'You have reached the limit of {n} submitted games.',

  /* ---- footer ---- */
  footer_parody:
    'STEAMDER is a parody. It is not affiliated with Valve Corporation, Steam, Match Group or Tinder. Game titles, cover art and metadata belong to their respective owners and are shown from their original sources; titles we have no artwork for get a generated placeholder instead. Game data from RAWG.',
  footer_privacy:
    'Real names and locations are only ever sent to friends you have accepted.',
} as const;

export type Key = keyof typeof EN;

const FR: Record<Key, string> = {
  /* ---- brand / chrome ---- */
  tagline: 'Vos relations, cataloguées.',
  nav_store: 'Boutique',
  nav_library: 'Bibliothèque',
  nav_community: 'Communauté',
  nav_profile: 'Profil',
  nav_friends: 'Amis',
  nav_settings: 'Paramètres',
  nav_login: 'Connexion',
  nav_register: 'Inscription',
  nav_logout: 'Déconnexion',
  nav_add: 'Ajouter une relation',
  search_placeholder: 'rechercher',
  search_users_placeholder: 'rechercher un joueur',
  install_steamder: 'Installer STEAMDER',
  lang_switch: 'Langue',

  /* ---- store front ---- */
  store_featured: 'Sélection et recommandations',
  store_trending: 'Tendances chez vos semblables',
  store_recent_reviews: 'Évaluations récentes',
  store_top_rated: 'Les mieux notées de la saison',
  store_new_arrivals: 'Nouveautés',
  store_browse_all: 'Tout parcourir',
  store_special_offer: 'Offre spéciale',
  store_hero_title: 'Toutes vos relations. Évaluées.',
  store_hero_body:
    'Ajoutez une relation à votre bibliothèque, assignez-lui un jeu, notez-la sur 100 et laissez vos amis lire l’évaluation. Ils ne voient le vrai nom que si vous les avez acceptés.',
  store_cta_start: 'Créer ma bibliothèque',
  store_cta_browse: 'Parcourir la communauté',
  store_players_now: '{n} en couple en ce moment',
  store_stat_relationships: 'relations cataloguées',
  store_stat_players: 'joueurs inscrits',
  store_stat_hours: 'heures de jeu enregistrées',
  store_stat_games: 'titres au catalogue',

  /* ---- library ---- */
  lib_title: 'Bibliothèque',
  lib_all: 'Tout',
  lib_search: 'Rechercher dans la bibliothèque',
  lib_installed: 'En cours',
  lib_uninstalled: 'Désinstallées',
  lib_wishlist: 'Liste de souhaits',
  lib_count: '{n} dans la bibliothèque',
  lib_empty_title: 'Votre bibliothèque est vide',
  lib_empty_body: 'Ajoutez votre première relation pour commencer votre catalogue.',
  lib_last_played: 'Dernière session',
  lib_hours_total: '{n} h au compteur',
  lib_play: 'Jouer',
  lib_replay: 'Rejouer',
  lib_install: 'Installer',
  lib_uninstalled_btn: 'Désinstallé',
  lib_sort: 'Trier par',
  sort_recent: 'Plus récentes',
  sort_hours: 'Heures de jeu',
  sort_score: 'Note',
  sort_name: 'Titre',

  /* ---- relationship fields ---- */
  f_real_name: 'Vrai prénom',
  f_real_location: 'Lieu',
  f_game: 'Jeu assigné',
  f_status: 'Statut',
  f_verdict: 'Verdict',
  f_score: 'Note',
  f_long_distance: 'À distance',
  f_started: 'Début le',
  f_ended: 'Fin le',
  f_review: 'Évaluation publique',
  f_notes: 'Notes privées',
  f_tags: 'Étiquettes',
  f_duration: 'Durée',
  f_hours: 'Heures de jeu',

  /* ---- statuses ---- */
  st_ongoing: 'En cours',
  st_situationship: 'Accès anticipé',
  st_on_hold: 'En pause',
  st_ended: 'Terminée',
  st_ghosted: 'Abandonnée',
  st_wishlist: 'Dans la liste de souhaits',

  /* ---- verdicts ---- */
  v_recommended: 'Recommandé',
  v_not_recommended: 'Non recommandé',

  /* ---- add / edit ---- */
  add_title: 'Ajouter une relation à votre bibliothèque',
  add_intro:
    'Les champs privés ne sont montrés qu’aux amis que vous avez acceptés. Tout le reste est public.',
  add_submit: 'Ajouter à la bibliothèque',
  edit_title: 'Modifier la relation',
  edit_submit: 'Enregistrer',
  edit_delete: 'Retirer de la bibliothèque',
  edit_delete_confirm:
    'Retirer cette relation de votre bibliothèque ? Cette action est irréversible.',
  section_private: 'Privé — amis uniquement',
  section_public: 'Public — visible par tous',
  pick_game: 'Choisir un jeu',
  pick_game_hint:
    'Le jeu définit la jaquette, la bannière et les couleurs de la page. Les non-amis ne voient que ce titre.',
  game_search_placeholder: 'Rechercher dans le catalogue…',
  score_hint: 'De 0 à 100, comme une note de test.',
  tags_hint: 'Séparées par des virgules. Les étiquettes alimentent vos succès.',
  ongoing_hint: 'Laissez la date de fin vide si c’est toujours en cours.',

  /* ---- relationship page ---- */
  app_all_reviews: 'Toutes les évaluations',
  app_about: 'À propos de cette relation',
  app_details: 'Détails',
  app_developer: 'Développeur',
  app_publisher: 'Éditeur',
  app_release_date: 'Date de sortie',
  app_genre: 'Genre',
  app_players: 'Joueurs',
  app_single: 'Un joueur',
  app_coop: 'Coopératif',
  app_languages: 'Langues',
  app_screenshots: 'Captures d’écran',
  app_your_review: 'Votre évaluation',
  app_no_review: 'Aucune évaluation rédigée.',
  app_reviewed_by: 'Évalué par',
  app_hidden_name: 'Nom masqué',
  app_hidden_location: 'Lieu masqué',
  app_locked_title: 'Contenu réservé aux amis',
  app_locked_body:
    'Ajoutez {name} en ami pour voir le vrai prénom, le lieu et les notes privées de cette relation.',
  app_locked_short: 'Amis uniquement',
  app_owned_by: 'Dans la bibliothèque de',
  app_edit: 'Modifier',
  app_other_players: 'Ils ont aussi joué à ce titre',
  app_no_other_players: 'Personne d’autre n’a ce titre dans sa bibliothèque.',
  app_playtime_forecast: 'Durée de vie estimée',
  app_still_running: 'toujours en cours',
  app_price_free: 'Gratuit',
  app_price_costly: 'Émotionnellement coûteux',
  app_metacritic: 'Note STEAMDER',
  app_tags: 'Étiquettes',
  app_dlc: 'Contenu téléchargeable',

  /* ---- profile ---- */
  prof_level: 'Niveau',
  prof_online: 'En ligne',
  prof_offline: 'Vu {when}',
  prof_relationships: 'Relations',
  prof_friends: 'Amis',
  prof_achievements: 'Succès',
  prof_hours: 'Heures',
  prof_showcase: 'Vitrine',
  prof_recent_activity: 'Activité récente',
  prof_stats: 'Statistiques',
  prof_no_bio: 'Aucune information renseignée.',
  prof_add_friend: 'Ajouter en ami',
  prof_pending: 'Invitation envoyée',
  prof_accept: 'Accepter l’invitation',
  prof_remove_friend: 'Retirer de mes amis',
  prof_is_friend: 'Amis',
  prof_edit: 'Modifier le profil',
  prof_login_to_add: 'Connectez-vous pour ajouter des amis',
  prof_private_note: 'Vous voyez les vrais prénoms car vous êtes amis.',
  prof_public_note:
    'Vous n’êtes pas amis : les vrais prénoms et les lieux sont masqués.',
  prof_favourite: 'Titre favori',
  prof_avg_score: 'Note moyenne',
  prof_avg_hours: 'Moyenne d’heures par relation',
  prof_longest: 'Plus longue partie',
  prof_shortest: 'Plus courte partie',
  prof_completion: 'Taux de complétion',
  prof_ld_share: 'À distance',
  prof_by_status: 'Par statut',
  prof_by_genre: 'Par genre',
  prof_perfect_games: 'Jeux parfaits',
  prof_refunded: 'Remboursées',

  /* ---- friends / community ---- */
  com_title: 'Communauté',
  com_players: 'Joueurs',
  com_find: 'Trouver des joueurs',
  com_no_results: 'Aucun joueur ne correspond à cette recherche.',
  fr_title: 'Amis',
  fr_incoming: 'Invitations reçues',
  fr_outgoing: 'Invitations envoyées',
  fr_yours: 'Vos amis',
  fr_none:
    'Vous n’avez pas encore d’amis. C’est à ça que sert l’onglet communauté.',
  fr_none_incoming: 'Aucune invitation en attente.',
  fr_none_outgoing: 'Aucune invitation envoyée.',
  fr_accept: 'Accepter',
  fr_decline: 'Refuser',
  fr_cancel: 'Annuler l’invitation',
  fr_shared: '{n} relations visibles pour vous',

  /* ---- settings ---- */
  set_title: 'Paramètres du profil',
  set_display_name: 'Nom affiché',
  set_handle: 'URL personnalisée',
  set_bio: 'Présentation',
  set_country: 'Pays',
  set_theme: 'Thème du profil',
  set_frame: 'Cadre d’avatar',
  set_showcase: 'Vitrine mise en avant',
  set_avatar: 'Avatar',
  set_avatar_reroll: 'Générer un nouvel avatar',
  set_featured: 'Relation mise en avant',
  set_featured_none: 'Aucune',
  set_save: 'Enregistrer',
  set_saved: 'Paramètres enregistrés.',
  set_lang: 'Langue de l’interface',

  /* ---- themes / frames ---- */
  th_crimson: 'Carmin',
  th_ember: 'Braise',
  th_velvet: 'Velours',
  th_obsidian: 'Obsidienne',
  th_rose: 'Rose',
  fr_none_frame: 'Sans cadre',
  fr_gold: 'Or',
  fr_flame: 'Flamme',
  fr_shattered: 'Brisé',
  fr_verified: 'Vérifié',
  sc_stats: 'Statistiques',
  sc_achievements: 'Succès',
  sc_top_rated: 'Mieux notées',
  sc_worst_rated: 'Moins bien notées',

  /* ---- auth ---- */
  auth_login_title: 'Se connecter à STEAMDER',
  auth_register_title: 'Créer votre compte STEAMDER',
  auth_handle: 'Nom de compte',
  auth_password: 'Mot de passe',
  auth_password_confirm: 'Confirmer le mot de passe',
  auth_display_name: 'Nom affiché',
  auth_submit_login: 'Se connecter',
  auth_submit_register: 'Créer le compte',
  auth_no_account: 'Pas de compte ?',
  auth_have_account: 'Déjà inscrit ?',
  auth_handle_hint: 'De 3 à 24 caractères : lettres, chiffres, - et _.',
  auth_password_hint: '8 caractères minimum.',
  auth_err_credentials: 'Nom de compte ou mot de passe incorrect.',
  auth_err_handle_taken: 'Ce nom de compte est déjà pris.',
  auth_err_handle_invalid:
    'Le nom de compte doit faire de 3 à 24 caractères : lettres, chiffres, - ou _.',
  auth_err_password_short: 'Le mot de passe doit faire au moins 8 caractères.',
  auth_err_password_mismatch: 'Les deux mots de passe ne correspondent pas.',
  auth_err_name_required: 'Choisissez un nom affiché.',
  auth_login_required: 'Vous devez être connecté pour faire ça.',
  auth_demo_hint: 'Comptes de démo : {accounts} — mot de passe {password}',

  /* ---- generic ---- */
  g_cancel: 'Annuler',
  g_back: 'Retour',
  g_yes: 'Oui',
  g_no: 'Non',
  g_none: 'Aucun',
  g_unknown: 'Inconnu',
  g_days: '{n} jours',
  g_months: '{n} mois',
  g_years: '{n} ans',
  g_hours: '{n} h',
  g_and_more: 'et {n} de plus',
  g_of: 'sur',
  g_view_all: 'Tout voir',
  g_not_found: 'Introuvable',
  g_not_found_body: 'Cette page n’existe pas, ou elle a été désinstallée.',
  g_error: 'Une erreur est survenue',
  g_required: 'Ce champ est obligatoire.',

  /* ---- user-submitted games ---- */
  cg_add_title: 'Ajouter un jeu au catalogue',
  cg_edit_title: 'Modifier votre jeu',
  cg_intro:
    'Un titre manque ? Ajoutez-le vous-même. Tout le monde pourra ensuite l’assigner à une relation, et les visuels que vous envoyez deviennent sa jaquette, sa bannière et les couleurs de sa page.',
  cg_privacy:
    'Le titre et les visuels sont publics, et visibles par des personnes qui ne sont pas vos amis. N’y mettez pas un vrai prénom — c’est le rôle des champs privés d’une relation.',
  cg_name: 'Titre du jeu',
  cg_year: 'Année de sortie',
  cg_year_hint: 'Facultatif.',
  cg_genre: 'Genre',
  cg_tags: 'Étiquettes',
  cg_tags_hint: 'Séparées par des virgules, 8 maximum. Affichées sur la page du jeu.',
  cg_banner: 'Image de bannière',
  cg_banner_hint:
    'Sert à la bannière large et à la vignette de liste. JPEG, PNG, WebP ou AVIF, {mb} Mo maximum. Recadrée en 1920 × 620 et 460 × 215.',
  cg_cover: 'Jaquette portrait',
  cg_cover_hint:
    'Facultative. Recadrée en 600 × 900 pour la capsule de bibliothèque. Sans elle, c’est la bannière qui est recadrée.',
  cg_replace_art: 'Remplacer les visuels',
  cg_replace_art_hint: 'Laissez vide pour conserver les images actuelles.',
  cg_submit: 'Ajouter le jeu',
  cg_save: 'Enregistrer le jeu',
  cg_saved: 'Jeu enregistré.',
  cg_mine: 'Vos jeux',
  cg_mine_none: 'Vous n’avez pas encore ajouté de jeu.',
  cg_manage: 'Gérer vos jeux',
  cg_badge: 'Communauté',
  cg_by: 'Ajouté par',
  cg_used_by: 'Utilisé par {n}',
  cg_unused: 'Pas encore utilisé',
  cg_delete: 'Supprimer',
  cg_delete_confirm:
    'Supprimer ce jeu du catalogue ? Les visuels sont supprimés également.',
  cg_delete_blocked:
    'Ce jeu ne peut pas être supprimé tant que des relations y renvoient.',
  cg_edit: 'Modifier',
  cg_add_link: 'Pas dans la liste ?',
  cg_add_cta: 'Ajouter un jeu',
  cg_count: '{n} / {max} jeux ajoutés',
  cg_err_title: 'Donnez un titre au jeu.',
  cg_err_banner: 'Une image de bannière est obligatoire.',
  cg_err_limit: 'Vous avez atteint la limite de {n} jeux ajoutés.',

  /* ---- footer ---- */
  footer_parody:
    'STEAMDER est une parodie, sans aucun lien avec Valve Corporation, Steam, Match Group ou Tinder. Les titres, jaquettes et métadonnées de jeux appartiennent à leurs ayants droit respectifs et sont affichés depuis leurs sources d’origine ; les titres sans visuel disponible reçoivent une illustration générée. Données de jeux fournies par RAWG.',
  footer_privacy:
    'Les vrais prénoms et les lieux ne sont transmis qu’aux amis que vous avez acceptés.',
};

const TABLES: Record<Lang, Record<Key, string>> = { en: EN, fr: FR };

export type Translate = (key: Key, vars?: Record<string, string | number>) => string;

/** Build a translator for a language. Interpolates `{name}` placeholders. */
export function makeT(lang: Lang): Translate {
  const table = TABLES[lang] ?? TABLES[DEFAULT_LANG];
  return (key, vars) => {
    let out = table[key] ?? EN[key] ?? String(key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        out = out.replaceAll(`{${k}}`, String(v));
      }
    }
    return out;
  };
}

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/* ------------------------------------------------- enum label key helpers */

import type { Showcase, Status, Theme, AvatarFrame, Verdict } from './types';
import type { Genre } from './games';

export function statusKey(s: Status): Key {
  return `st_${s}` as Key;
}

export function verdictKey(v: Verdict): Key {
  return `v_${v}` as Key;
}

export function themeKey(t: Theme): Key {
  return `th_${t}` as Key;
}

export function frameKey(f: AvatarFrame): Key {
  return (f === 'none' ? 'fr_none_frame' : `fr_${f}`) as Key;
}

export function showcaseKey(s: Showcase): Key {
  return `sc_${s}` as Key;
}

/** Genre labels live outside the main table because there are a lot of them. */
const GENRE_LABELS: Record<Genre, [string, string]> = {
  action: ['Action', 'Action'],
  rpg: ['RPG', 'JdR'],
  fps: ['FPS', 'FPS'],
  horror: ['Horror', 'Horreur'],
  sim: ['Simulation', 'Simulation'],
  strategy: ['Strategy', 'Stratégie'],
  sports: ['Sports', 'Sport'],
  racing: ['Racing', 'Course'],
  puzzle: ['Puzzle', 'Réflexion'],
  platformer: ['Platformer', 'Plateforme'],
  survival: ['Survival', 'Survie'],
  mmo: ['MMO', 'MMO'],
  visual_novel: ['Visual Novel', 'Visual novel'],
  roguelike: ['Roguelike', 'Roguelike'],
  sandbox: ['Sandbox', 'Bac à sable'],
  fighting: ['Fighting', 'Combat'],
  stealth: ['Stealth', 'Infiltration'],
  metroidvania: ['Metroidvania', 'Metroidvania'],
  dating_sim: ['Dating Sim', 'Dating sim'],
  walking_sim: ['Narrative', 'Narratif'],
};

export function genreLabel(genre: Genre, lang: Lang): string {
  const pair = GENRE_LABELS[genre] ?? GENRE_LABELS.action;
  return lang === 'fr' ? pair[1] : pair[0];
}
