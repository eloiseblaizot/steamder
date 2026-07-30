/**
 * STEAMDER's local game catalogue.
 *
 * Real game titles, used as the public alias for a relationship. Cover art is
 * generated procedurally from each entry's palette (see `art.ts`) — we ship no
 * copyrighted artwork, only original abstract art keyed to a colour identity.
 *
 * Tuple layout: [slug, title, year, genre, deep, mid, accent, tags]
 */

export const GENRES = [
  'action',
  'rpg',
  'fps',
  'horror',
  'sim',
  'strategy',
  'sports',
  'racing',
  'puzzle',
  'platformer',
  'survival',
  'mmo',
  'visual_novel',
  'roguelike',
  'sandbox',
  'fighting',
  'stealth',
  'metroidvania',
  'dating_sim',
  'walking_sim',
] as const;
export type Genre = (typeof GENRES)[number];

export interface Game {
  slug: string;
  title: string;
  year: number;
  genre: Genre;
  /** [deep background, mid tone, bright accent] */
  colors: [string, string, string];
  tags: string[];
}

type Tuple = [string, string, number, Genre, string, string, string, string];

const RAW: Tuple[] = [
  // ---------- shooters ----------
  ['doom-eternal', 'DOOM Eternal', 2020, 'fps', '#2b0a06', '#8f1d10', '#ff6a2b', 'intense|fast-paced|no-dialogue'],
  ['half-life-2', 'Half-Life 2', 2004, 'fps', '#14202b', '#3d6079', '#f0a93b', 'atmospheric|silent-protagonist|classic'],
  ['portal-2', 'Portal 2', 2011, 'puzzle', '#101418', '#2c6a86', '#ff8a1e', 'witty|puzzle|betrayal'],
  ['counter-strike-2', 'Counter-Strike 2', 2023, 'fps', '#1a1d22', '#4a5560', '#f2b33d', 'competitive|toxic-chat|team-based'],
  ['titanfall-2', 'Titanfall 2', 2016, 'fps', '#101a22', '#2f6b7a', '#e8f0f4', 'underrated|movement|short-campaign'],
  ['bioshock', 'BioShock', 2007, 'fps', '#0d1a1c', '#1f5a5e', '#c9a44a', 'atmospheric|twist|art-deco'],
  ['borderlands-2', 'Borderlands 2', 2012, 'fps', '#1d1508', '#a35c14', '#f5c542', 'loot|co-op|comedy'],
  ['destiny-2', 'Destiny 2', 2017, 'mmo', '#111624', '#37447a', '#d8dce8', 'grindy|live-service|fomo'],
  ['apex-legends', 'Apex Legends', 2019, 'fps', '#1e0f10', '#8c2a24', '#e8623a', 'battle-royale|squad|sweaty'],
  ['overwatch-2', 'Overwatch 2', 2022, 'fps', '#12203a', '#2b6fb5', '#f79c2a', 'team-based|hero-shooter|drama'],
  ['halo-infinite', 'Halo Infinite', 2021, 'fps', '#0f1a16', '#2d6b4a', '#9ad3b0', 'nostalgic|grapple|open-world'],
  ['team-fortress-2', 'Team Fortress 2', 2007, 'fps', '#231a14', '#8a4a2a', '#e8c39a', 'chaotic|free-to-play|hats'],
  ['left-4-dead-2', 'Left 4 Dead 2', 2009, 'survival', '#1a1712', '#5c4a22', '#c4d13a', 'co-op|zombies|friendship-ending'],
  ['far-cry-3', 'Far Cry 3', 2012, 'fps', '#0f1c12', '#2f7a3a', '#f2d24a', 'tropical|villain|repetitive'],
  ['metro-exodus', 'Metro Exodus', 2019, 'fps', '#161a1e', '#4a5a52', '#d8a03a', 'bleak|survival|slavic'],

  // ---------- role-playing ----------
  ['baldurs-gate-3', "Baldur's Gate 3", 2023, 'rpg', '#1b1224', '#5b2a6a', '#d9a13a', 'romance-options|choices-matter|long'],
  ['skyrim', 'The Elder Scrolls V: Skyrim', 2011, 'rpg', '#141a20', '#3d5a6a', '#c8d6de', 'open-world|modded|infinite'],
  ['witcher-3', 'The Witcher 3: Wild Hunt', 2015, 'rpg', '#1a1410', '#6a4020', '#e0c090', 'mature|choices-matter|gwent'],
  ['mass-effect-2', 'Mass Effect 2', 2010, 'rpg', '#0d1424', '#2a4a8a', '#f27a2a', 'loyalty-missions|romance|suicide-mission'],
  ['dragon-age-origins', 'Dragon Age: Origins', 2009, 'rpg', '#1c1214', '#7a2226', '#d9b06a', 'dark-fantasy|party|approval-rating'],
  ['persona-5-royal', 'Persona 5 Royal', 2019, 'rpg', '#140a0c', '#a01224', '#f0f0f0', 'stylish|social-links|calendar'],
  ['final-fantasy-vii', 'Final Fantasy VII', 1997, 'rpg', '#0e1420', '#2a4a6a', '#8ac0d8', 'classic|melodrama|materia'],
  ['disco-elysium', 'Disco Elysium', 2019, 'rpg', '#1a1a24', '#4a4a7a', '#d8a860', 'text-heavy|introspective|no-combat'],
  ['dark-souls-3', 'Dark Souls III', 2016, 'rpg', '#16130f', '#4a3a2a', '#c07a2a', 'punishing|cryptic|git-gud'],
  ['elden-ring', 'Elden Ring', 2022, 'rpg', '#151208', '#5a4a12', '#e0c05a', 'vast|obtuse|maidenless'],
  ['bloodborne', 'Bloodborne', 2015, 'horror', '#120e12', '#4a2434', '#c8b0a0', 'gothic|aggressive|blood'],
  ['nier-automata', 'NieR: Automata', 2017, 'action', '#1c1c18', '#6a6a5a', '#e8e4d8', 'existential|multiple-endings|sad'],
  ['divinity-original-sin-2', 'Divinity: Original Sin 2', 2017, 'rpg', '#131a1c', '#2a6a6a', '#e0b04a', 'co-op|systemic|barrelmancy'],
  ['cyberpunk-2077', 'Cyberpunk 2077', 2020, 'rpg', '#12121c', '#2a2a5a', '#f0e02a', 'rough-launch|redeemed|night-city'],
  ['fallout-new-vegas', 'Fallout: New Vegas', 2010, 'rpg', '#1c1810', '#7a6224', '#e8c04a', 'factions|buggy|best-writing'],
  ['undertale', 'Undertale', 2015, 'rpg', '#0c0c0c', '#3a2a5a', '#f0d02a', 'pacifist-run|meta|determination'],
  ['pathologic-2', 'Pathologic 2', 2019, 'survival', '#141412', '#4a4636', '#b0a070', 'oppressive|hostile|plague'],

  // ---------- horror ----------
  ['silent-hill-2', 'Silent Hill 2', 2001, 'horror', '#14140f', '#3a3a2a', '#8a2a2a', 'psychological|fog|guilt'],
  ['resident-evil-4', 'Resident Evil 4', 2005, 'horror', '#1a1210', '#6a3020', '#d8a05a', 'campy|tense|merchant'],
  ['outlast', 'Outlast', 2013, 'horror', '#101012', '#2a2a34', '#4ae0a0', 'no-combat|running|camcorder'],
  ['amnesia-the-dark-descent', 'Amnesia: The Dark Descent', 2010, 'horror', '#0e1010', '#26343a', '#c8a860', 'hiding|sanity|dread'],
  ['phasmophobia', 'Phasmophobia', 2020, 'horror', '#0e1216', '#2a3a4a', '#6ad8e0', 'co-op|voice-chat|screaming'],
  ['dead-by-daylight', 'Dead by Daylight', 2016, 'horror', '#120e10', '#4a2028', '#c8402a', 'asymmetric|toxic|chase'],
  ['soma', 'SOMA', 2015, 'horror', '#0c1418', '#1e4a5a', '#4ad0c0', 'existential|underwater|identity'],

  // ---------- simulation & cosy ----------
  ['stardew-valley', 'Stardew Valley', 2016, 'sim', '#152012', '#4a7a2a', '#f0c84a', 'cosy|marriage-candidates|time-sink'],
  ['animal-crossing', 'Animal Crossing: New Horizons', 2020, 'sim', '#123020', '#3aa07a', '#f8e0a0', 'wholesome|daily-chores|debt'],
  ['the-sims-4', 'The Sims 4', 2014, 'sim', '#0e2030', '#2a8ac0', '#8ae0f0', 'woohoo|dlc-hell|drowning-in-pools'],
  ['harvest-moon', 'Harvest Moon: Back to Nature', 1999, 'sim', '#1a2410', '#5a7a2a', '#e8d060', 'rustic|courting|slow'],
  ['spiritfarer', 'Spiritfarer', 2020, 'sim', '#141a2a', '#3a5a8a', '#f0d8a0', 'grief|gentle|goodbyes'],
  ['unpacking', 'Unpacking', 2021, 'puzzle', '#1c1620', '#6a4a6a', '#f0c0a0', 'wordless|moving-in|storytelling'],
  ['powerwash-simulator', 'PowerWash Simulator', 2022, 'sim', '#101c24', '#2a6a8a', '#a0e8f0', 'meditative|satisfying|no-stakes'],
  ['euro-truck-simulator-2', 'Euro Truck Simulator 2', 2012, 'sim', '#12161c', '#3a4a6a', '#e0a83a', 'long-haul|podcast-game|lonely'],
  ['cities-skylines', 'Cities: Skylines', 2015, 'sim', '#101a1a', '#2a6a5a', '#c8e04a', 'traffic|zoning|mods'],
  ['papers-please', 'Papers, Please', 2013, 'sim', '#14161a', '#3a4048', '#c04a2a', 'bureaucracy|moral-choices|glory-to-arstotzka'],

  // ---------- strategy ----------
  ['civilization-vi', 'Civilization VI', 2016, 'strategy', '#101c26', '#2a6a8a', '#e8c04a', 'one-more-turn|4am|empire'],
  ['xcom-2', 'XCOM 2', 2016, 'strategy', '#101418', '#2a5a4a', '#7ae04a', 'permadeath|95-percent-miss|panic'],
  ['crusader-kings-3', 'Crusader Kings III', 2020, 'strategy', '#1a1410', '#6a4a24', '#d8b060', 'dynasty|scheming|inbreeding'],
  ['total-war-warhammer-3', 'Total War: Warhammer III', 2022, 'strategy', '#1a1014', '#7a2434', '#e0a040', 'grand-battles|dlc|chaos'],
  ['starcraft-2', 'StarCraft II', 2010, 'strategy', '#0e1424', '#2a4a9a', '#4ad0f0', 'apm|esports|korean'],
  ['frostpunk', 'Frostpunk', 2018, 'strategy', '#141a20', '#3a5a70', '#f0a03a', 'bleak|hard-choices|cold'],
  ['into-the-breach', 'Into the Breach', 2018, 'strategy', '#101418', '#2a5a6a', '#f0d84a', 'perfect-information|tight|puzzle-like'],
  ['fire-emblem-three-houses', 'Fire Emblem: Three Houses', 2019, 'strategy', '#141020', '#4a3a7a', '#d8c060', 'social-links|permadeath|houses'],

  // ---------- roguelike ----------
  ['hades', 'Hades', 2020, 'roguelike', '#140c1c', '#5a2470', '#f04a2a', 'romanceable|voice-acting|one-more-run'],
  ['slay-the-spire', 'Slay the Spire', 2019, 'roguelike', '#140f14', '#4a2a3a', '#e0a83a', 'deckbuilder|addictive|ascension'],
  ['dead-cells', 'Dead Cells', 2018, 'roguelike', '#0c1418', '#1a5a6a', '#a0f0d0', 'fast|fluid|cursed-chest'],
  ['risk-of-rain-2', 'Risk of Rain 2', 2020, 'roguelike', '#141a20', '#3a5a7a', '#f0c060', 'co-op|scaling|time-pressure'],
  ['balatro', 'Balatro', 2024, 'roguelike', '#14141c', '#3a3a6a', '#e04a5a', 'just-one-more|poker|dangerous'],
  ['binding-of-isaac', 'The Binding of Isaac: Rebirth', 2014, 'roguelike', '#141010', '#4a2020', '#c8a878', 'grotesque|synergies|hours'],
  ['returnal', 'Returnal', 2021, 'roguelike', '#0e1420', '#2a3a7a', '#e07ad0', 'loop|bullet-hell|cryptic'],

  // ---------- platformers & metroidvania ----------
  ['hollow-knight', 'Hollow Knight', 2017, 'metroidvania', '#0c1020', '#1e3a6a', '#d8e8f0', 'melancholy|hard|beautiful'],
  ['celeste', 'Celeste', 2018, 'platformer', '#1a1024', '#6a2a6a', '#8ae0f0', 'anxiety|precise|kind'],
  ['ori-and-the-will-of-the-wisps', 'Ori and the Will of the Wisps', 2020, 'metroidvania', '#0e1a1c', '#2a6a6a', '#f0e8c0', 'gorgeous|emotional|fluid'],
  ['super-meat-boy', 'Super Meat Boy', 2010, 'platformer', '#1a0e0e', '#7a1a1a', '#f0e0d0', 'rage|precise|retry'],
  ['a-hat-in-time', 'A Hat in Time', 2017, 'platformer', '#141a2a', '#3a5aa0', '#f0c84a', 'charming|3d-platformer|cosy'],
  ['cuphead', 'Cuphead', 2017, 'action', '#1a1410', '#7a5a2a', '#f0d8a0', 'brutal|hand-drawn|boss-rush'],
  ['hades-2', 'Hades II', 2024, 'roguelike', '#0c1420', '#2a4a7a', '#e0c04a', 'witchcraft|early-access|hot-cast'],
  ['blasphemous', 'Blasphemous', 2019, 'metroidvania', '#1a1410', '#6a3a24', '#d8c090', 'grim|catholic-guilt|pixel-gore'],

  // ---------- action / adventure ----------
  ['god-of-war', 'God of War', 2018, 'action', '#141a1c', '#3a5a6a', '#d8a03a', 'dad-game|boy|axe'],
  ['red-dead-redemption-2', 'Red Dead Redemption 2', 2018, 'action', '#1a1610', '#6a5024', '#e0b060', 'slow-burn|tragic|horses'],
  ['gta-v', 'Grand Theft Auto V', 2013, 'action', '#141a14', '#3a6a3a', '#e8d040', 'chaos|online|shark-cards'],
  ['zelda-breath-of-the-wild', 'The Legend of Zelda: Breath of the Wild', 2017, 'action', '#141c14', '#3a7a5a', '#e8d88a', 'freedom|climbing|shrines'],
  ['zelda-tears-of-the-kingdom', 'The Legend of Zelda: Tears of the Kingdom', 2023, 'action', '#141a24', '#3a5a8a', '#e0d060', 'physics|building|sky'],
  ['sekiro', 'Sekiro: Shadows Die Twice', 2019, 'action', '#141614', '#3a4a3a', '#c8b070', 'rhythm|unforgiving|hesitation-is-defeat'],
  ['ghost-of-tsushima', 'Ghost of Tsushima', 2020, 'action', '#1a1410', '#7a4a24', '#f0c860', 'beautiful|honour|wind'],
  ['spider-man-2', "Marvel's Spider-Man 2", 2023, 'action', '#1a1018', '#8a1a3a', '#e04a5a', 'swinging|cinematic|short'],
  ['control', 'Control', 2019, 'action', '#141418', '#4a3a5a', '#e04a3a', 'weird|brutalist|telekinesis'],
  ['death-stranding', 'Death Stranding', 2019, 'walking_sim', '#141a1c', '#3a5a6a', '#e0d8c0', 'divisive|delivery|loneliness'],
  ['journey', 'Journey', 2012, 'walking_sim', '#241810', '#8a5a24', '#f0d090', 'wordless|brief|companionship'],
  ['firewatch', 'Firewatch', 2016, 'walking_sim', '#2a1410', '#a04a24', '#f0c060', 'radio|slow|anticlimax'],
  ['what-remains-of-edith-finch', 'What Remains of Edith Finch', 2017, 'walking_sim', '#141822', '#3a4a6a', '#e0c890', 'vignettes|grief|short'],
  ['gone-home', 'Gone Home', 2013, 'walking_sim', '#141018', '#3a2a4a', '#e0b070', 'domestic|queer|no-ghosts'],
  ['stanley-parable', 'The Stanley Parable', 2013, 'walking_sim', '#141a1c', '#3a5a6a', '#e8e0c0', 'meta|narrator|choice-illusion'],

  // ---------- multiplayer & social ----------
  ['among-us', 'Among Us', 2018, 'strategy', '#141820', '#2a3a5a', '#e04a4a', 'betrayal|lying|friendship-ending'],
  ['fall-guys', 'Fall Guys', 2020, 'sports', '#241a30', '#7a4aa0', '#f0a8c0', 'silly|chaotic|rage'],
  ['minecraft', 'Minecraft', 2011, 'sandbox', '#14201a', '#3a7a4a', '#c8a070', 'infinite|creative|creepers'],
  ['terraria', 'Terraria', 2011, 'sandbox', '#14201c', '#2a7a6a', '#e0c85a', 'progression|dense|co-op'],
  ['valheim', 'Valheim', 2021, 'survival', '#141a18', '#3a5a4a', '#c8a860', 'norse|co-op|boat-trauma'],
  ['rust', 'Rust', 2018, 'survival', '#1a1410', '#6a4424', '#d87a3a', 'brutal|griefing|trust-issues'],
  ['dont-starve-together', "Don't Starve Together", 2016, 'survival', '#141210', '#3a3024', '#d8b860', 'grim-whimsy|co-op|hunger'],
  ['deep-rock-galactic', 'Deep Rock Galactic', 2020, 'fps', '#141014', '#4a2a4a', '#f0a83a', 'rock-and-stone|co-op|wholesome'],
  ['stardew-multiplayer', 'Stardew Valley (Co-op)', 2018, 'sim', '#182412', '#5a8a2a', '#f0d060', 'shared-farm|scheduling|cosy'],
  ['it-takes-two', 'It Takes Two', 2021, 'platformer', '#1c1424', '#6a3a7a', '#f0a060', 'co-op-only|divorce-plot|ironic'],
  ['a-way-out', 'A Way Out', 2018, 'action', '#141a20', '#3a4a6a', '#d8a850', 'co-op-only|split-screen|betrayal'],
  ['helldivers-2', 'Helldivers 2', 2024, 'fps', '#141820', '#2a4a6a', '#e0c02a', 'democracy|friendly-fire|co-op'],
  ['lethal-company', 'Lethal Company', 2023, 'horror', '#101414', '#2a3a3a', '#c8d84a', 'proximity-chat|screaming|quota'],
  ['sea-of-thieves', 'Sea of Thieves', 2018, 'sandbox', '#101c24', '#2a6a8a', '#e0c060', 'piracy|griefing|shanties'],
  ['world-of-warcraft', 'World of Warcraft', 2004, 'mmo', '#141a24', '#2a4a7a', '#e0b040', 'guild-drama|time-sink|expansions'],
  ['final-fantasy-xiv', 'Final Fantasy XIV', 2013, 'mmo', '#141824', '#3a4a8a', '#e0d0a0', 'free-trial|community|glamour'],
  ['runescape', 'Old School RuneScape', 2013, 'mmo', '#1a1810', '#5a5024', '#c8b060', 'grind|nostalgia|afk'],

  // ---------- fighting / sports / racing ----------
  ['street-fighter-6', 'Street Fighter 6', 2023, 'fighting', '#1a1014', '#8a2a3a', '#f0c04a', 'execution|frame-data|labbing'],
  ['tekken-8', 'Tekken 8', 2024, 'fighting', '#141420', '#3a3a7a', '#e07a3a', 'combos|rage-quit|family-drama'],
  ['super-smash-bros-ultimate', 'Super Smash Bros. Ultimate', 2018, 'fighting', '#141a24', '#3a5a9a', '#f0d84a', 'party|no-items|fox-only'],
  ['rocket-league', 'Rocket League', 2015, 'sports', '#101820', '#2a5a8a', '#f08a2a', 'what-a-save|toxic|skill-ceiling'],
  ['fifa-23', 'EA Sports FC 24', 2023, 'sports', '#101c14', '#2a7a4a', '#e0e0e0', 'annual|ultimate-team|scripted'],
  ['forza-horizon-5', 'Forza Horizon 5', 2021, 'racing', '#1c1420', '#6a3a7a', '#f0c060', 'gorgeous|chill|festival'],
  ['mario-kart-8-deluxe', 'Mario Kart 8 Deluxe', 2017, 'racing', '#141a2a', '#3a5aa0', '#f0d040', 'blue-shell|party|friendship-ending'],
  ['gran-turismo-7', 'Gran Turismo 7', 2022, 'racing', '#121620', '#2a3a6a', '#c8d0d8', 'simulation|grindy|beautiful'],
  ['trackmania', 'Trackmania', 2020, 'racing', '#101820', '#2a5a7a', '#c8f04a', 'time-attack|restart|obsessive'],

  // ---------- puzzle & short ----------
  ['tetris-effect', 'Tetris Effect', 2018, 'puzzle', '#141024', '#3a2a7a', '#e07ad0', 'hypnotic|emotional|zone'],
  ['baba-is-you', 'Baba Is You', 2019, 'puzzle', '#141618', '#3a4a4a', '#e0e8a0', 'brain-melting|rules|elegant'],
  ['the-witness', 'The Witness', 2016, 'puzzle', '#141a18', '#2a6a5a', '#e0d060', 'obtuse|island|epiphany'],
  ['outer-wilds', 'Outer Wilds', 2019, 'puzzle', '#141824', '#3a4a7a', '#f0a040', 'time-loop|knowledge|once-only'],
  ['return-of-the-obra-dinn', 'Return of the Obra Dinn', 2018, 'puzzle', '#181818', '#4a4a4a', '#d8d8c0', 'deduction|1-bit|notebook'],
  ['keep-talking-nobody-explodes', 'Keep Talking and Nobody Explodes', 2015, 'puzzle', '#141212', '#4a2a2a', '#e0c04a', 'communication|shouting|timer'],
  ['portal', 'Portal', 2007, 'puzzle', '#101418', '#2a5a7a', '#f0a03a', 'short|perfect|cake'],

  // ---------- visual novels & dating sims ----------
  ['doki-doki-literature-club', 'Doki Doki Literature Club!', 2017, 'visual_novel', '#1a1018', '#7a2a5a', '#f0b0c0', 'not-what-it-seems|meta|warning'],
  ['dream-daddy', 'Dream Daddy', 2017, 'dating_sim', '#1c1420', '#6a4a8a', '#f0b070', 'wholesome|dads|routes'],
  ['hatoful-boyfriend', 'Hatoful Boyfriend', 2011, 'dating_sim', '#141a20', '#3a5a7a', '#e0c8a0', 'pigeons|absurd|darker-than-expected'],
  ['steins-gate', 'Steins;Gate', 2009, 'visual_novel', '#141418', '#3a3a5a', '#c8d8e0', 'time-travel|slow-start|payoff'],
  ['clannad', 'Clannad', 2004, 'visual_novel', '#1a1c20', '#4a5a70', '#e0d0c0', 'routes|tears|after-story'],
  ['coffee-talk', 'Coffee Talk', 2020, 'visual_novel', '#141018', '#4a2a5a', '#e0a060', 'cosy|lo-fi|listening'],
  ['va-11-hall-a', 'VA-11 HALL-A', 2016, 'visual_novel', '#14101c', '#4a2a6a', '#e07ad0', 'cyberpunk|bartending|vibes'],
  ['florence', 'Florence', 2018, 'visual_novel', '#1c1420', '#7a4a6a', '#f0c0a0', 'short|breakup|honest'],
  ['emily-is-away', 'Emily Is Away', 2015, 'visual_novel', '#101418', '#2a3a5a', '#a0c0d8', 'nostalgic|aim|regret'],

  // ---------- stealth ----------
  ['dishonored-2', 'Dishonored 2', 2016, 'stealth', '#141618', '#3a4a52', '#d8a83a', 'clockwork|no-kills|systemic'],
  ['hitman-3', 'Hitman: World of Assassination', 2021, 'stealth', '#14141a', '#3a3a4a', '#e04a4a', 'sandbox|replayable|silent-assassin'],
  ['metal-gear-solid-v', 'Metal Gear Solid V: The Phantom Pain', 2015, 'stealth', '#1a1814', '#5a5030', '#d8c070', 'unfinished|mechanics|d-dog'],
  ['thief', 'Thief: The Dark Project', 1998, 'stealth', '#101210', '#2a3a2a', '#c8a860', 'atmospheric|dark|immersive-sim'],
  ['splinter-cell-chaos-theory', 'Splinter Cell: Chaos Theory', 2005, 'stealth', '#101418', '#2a4a4a', '#4ae070', 'peak|co-op|light-meter'],

  // ---------- classics & oddities ----------
  ['tomb-raider', 'Tomb Raider', 2013, 'action', '#1a1210', '#6a3a24', '#d8a860', 'reboot|survival|arrows'],
  ['assassins-creed-2', "Assassin's Creed II", 2009, 'action', '#141a20', '#3a5a7a', '#e0d0a0', 'renaissance|parkour|ezio'],
  ['sonic-adventure-2', 'Sonic Adventure 2', 2001, 'platformer', '#141a24', '#2a4a9a', '#f0d040', 'chao-garden|janky|nostalgia'],
  ['crash-bandicoot', 'Crash Bandicoot N. Sane Trilogy', 2017, 'platformer', '#1a1410', '#7a4a1a', '#f0a83a', 'hard|remaster|childhood'],
  ['kingdom-hearts-2', 'Kingdom Hearts II', 2005, 'rpg', '#141824', '#3a4a8a', '#e0d8b0', 'convoluted|earnest|disney'],
  ['pokemon-emerald', 'Pokémon Emerald', 2004, 'rpg', '#101c18', '#2a7a5a', '#e0d060', 'nostalgia|grinding|shinies'],
  ['pokemon-scarlet', 'Pokémon Scarlet', 2022, 'rpg', '#1a1010', '#8a2a1a', '#f0a03a', 'open-world|performance-issues|charming'],
  ['katamari-damacy', 'Katamari Damacy', 2004, 'puzzle', '#1c1424', '#6a3a8a', '#f0d060', 'absurd|soundtrack|rolling'],
  ['getting-over-it', 'Getting Over It with Bennett Foddy', 2017, 'platformer', '#141210', '#3a3024', '#c88a3a', 'rage|philosophy|falling'],
  ['goat-simulator', 'Goat Simulator', 2014, 'sandbox', '#141a12', '#3a6a2a', '#e0d840', 'broken-on-purpose|silly|physics'],
  ['flappy-bird', 'Flappy Bird', 2013, 'action', '#101c20', '#2a7a8a', '#f0d040', 'infuriating|simple|gone'],
  ['candy-crush', 'Candy Crush Saga', 2012, 'puzzle', '#1c1020', '#8a2a6a', '#f0a8c0', 'predatory|lives|microtransactions'],
  ['farmville', 'FarmVille', 2009, 'sim', '#1a1c10', '#5a6a1a', '#e0d040', 'notifications|obligation|dead'],
  ['second-life', 'Second Life', 2003, 'sandbox', '#141824', '#3a4a7a', '#c8d0e0', 'surreal|earnest|dated'],
  ['wii-sports', 'Wii Sports', 2006, 'sports', '#181c20', '#4a6a8a', '#f0f0f0', 'party|nostalgic|wrist-strap'],
  ['jenga', 'Jenga', 1983, 'puzzle', '#1c1810', '#7a5a24', '#e0c890', 'precarious|tense|collapse'],
  ['solitaire', 'Microsoft Solitaire', 1990, 'puzzle', '#101c14', '#2a6a3a', '#e0e0e0', 'solo|default|infinite'],
  ['minesweeper', 'Minesweeper', 1990, 'puzzle', '#181818', '#4a4a4a', '#c04a2a', 'guessing|anxiety|flags'],

  // ---------- early access / live service parody ----------
  ['no-mans-sky', "No Man's Sky", 2016, 'survival', '#1a1024', '#5a2a7a', '#f0a040', 'redemption-arc|vast|grindy'],
  ['star-citizen', 'Star Citizen', 2012, 'sim', '#101824', '#2a4a7a', '#c8d8e0', 'never-finished|expensive|promises'],
  ['dayz', 'DayZ', 2018, 'survival', '#141812', '#3a4a2a', '#c8b060', 'brutal|betrayal|janky'],
  ['pubg', 'PUBG: Battlegrounds', 2017, 'fps', '#1a1814', '#5a5030', '#e0a83a', 'janky|tense|frying-pan'],
  ['fortnite', 'Fortnite', 2017, 'fps', '#1a1428', '#5a3aa0', '#f0d040', 'building|collabs|kids'],
  ['league-of-legends', 'League of Legends', 2009, 'strategy', '#101820', '#2a5a6a', '#e0c060', 'toxic|300-hours|surrender'],
  ['dota-2', 'Dota 2', 2013, 'strategy', '#1a1010', '#6a2a1a', '#e0a03a', 'complex|toxic|comeback'],
  ['genshin-impact', 'Genshin Impact', 2020, 'rpg', '#141c24', '#2a6a8a', '#f0d8a0', 'gacha|pity|whales'],
  ['honkai-star-rail', 'Honkai: Star Rail', 2023, 'rpg', '#141420', '#3a3a7a', '#e0a8d8', 'gacha|turn-based|husbandos'],
  ['clash-royale', 'Clash Royale', 2016, 'strategy', '#141a24', '#2a5a9a', '#f0c040', 'pay-to-win|rage|chests'],
  ['diablo-4', 'Diablo IV', 2023, 'rpg', '#1a1012', '#6a1a24', '#e08a3a', 'seasons|loot|dark'],
  ['path-of-exile', 'Path of Exile', 2013, 'rpg', '#141210', '#3a2a24', '#c88a3a', 'overwhelming|free|spreadsheets'],
  ['warframe', 'Warframe', 2013, 'action', '#101a20', '#2a5a7a', '#c8e0e8', 'confusing|generous|space-ninjas'],
  ['elite-dangerous', 'Elite Dangerous', 2014, 'sim', '#101418', '#2a3a5a', '#e0a83a', 'vast|empty|beautiful'],
  ['eve-online', 'EVE Online', 2003, 'mmo', '#101420', '#2a3a6a', '#c8d8e8', 'spreadsheets|betrayal|scale'],
  ['the-finals', 'The Finals', 2023, 'fps', '#141824', '#2a4a8a', '#f0e04a', 'destruction|fast|underplayed'],
  ['palworld', 'Palworld', 2024, 'survival', '#141c1a', '#2a7a5a', '#f0c84a', 'controversial|fun|early-access'],
  ['vampire-survivors', 'Vampire Survivors', 2022, 'roguelike', '#140c14', '#3a1a4a', '#e0c040', 'cheap|addictive|screen-clutter'],
  ['stray', 'Stray', 2022, 'action', '#1a1420', '#6a3a5a', '#f0c060', 'cat|short|atmospheric'],
  ['cult-of-the-lamb', 'Cult of the Lamb', 2022, 'roguelike', '#141018', '#4a2a5a', '#f0d060', 'cute|sinister|management'],
  ['pizza-tower', 'Pizza Tower', 2023, 'platformer', '#1c1410', '#8a4a1a', '#f0e040', 'frantic|expressive|loud'],
  ['lies-of-p', 'Lies of P', 2023, 'rpg', '#141418', '#3a3a4a', '#c8a860', 'soulslike|puppets|belle-epoque'],
  ['armored-core-6', 'Armored Core VI', 2023, 'action', '#141618', '#3a4a52', '#e08a2a', 'mechs|build-crafting|walls'],
  ['alan-wake-2', 'Alan Wake 2', 2023, 'horror', '#101418', '#2a3a4a', '#e0d8a0', 'weird|beautiful|meta'],
  ['baldurs-gate-2', 'Baldur’s Gate II', 2000, 'rpg', '#141018', '#4a2a4a', '#d8b070', 'classic|dense|romance'],
  ['planescape-torment', 'Planescape: Torment', 1999, 'rpg', '#141014', '#3a2a3a', '#c8a870', 'text-heavy|philosophical|unique'],
  ['deus-ex', 'Deus Ex', 2000, 'stealth', '#141410', '#3a3a24', '#c8c040', 'immersive-sim|prescient|clunky'],
  ['system-shock-2', 'System Shock 2', 1999, 'horror', '#101418', '#1e4a5a', '#4ad0a0', 'oppressive|shodan|resource-scarce'],
  ['morrowind', 'The Elder Scrolls III: Morrowind', 2002, 'rpg', '#141810', '#4a5a2a', '#c8b060', 'obtuse|alien|no-quest-markers'],
  ['gothic-2', 'Gothic II', 2002, 'rpg', '#141610', '#3a4a24', '#c8a860', 'janky|earned-power|german'],
  ['kenshi', 'Kenshi', 2018, 'sandbox', '#1a1810', '#5a4a24', '#c8a860', 'brutal|emergent|limbs'],
  ['rimworld', 'RimWorld', 2018, 'sim', '#141810', '#4a5a2a', '#d8c060', 'stories|tragedy|organ-harvesting'],
  ['dwarf-fortress', 'Dwarf Fortress', 2006, 'sim', '#141212', '#3a2a2a', '#c8b878', 'losing-is-fun|deep|ascii'],
  ['factorio', 'Factorio', 2020, 'sim', '#141410', '#4a4a24', '#e0a83a', 'the-factory-must-grow|time-loss|spaghetti'],
  ['satisfactory', 'Satisfactory', 2024, 'sim', '#101c1a', '#2a6a6a', '#f0a83a', 'first-person|belts|obsessive'],
  ['oxygen-not-included', 'Oxygen Not Included', 2019, 'sim', '#101a1c', '#2a5a6a', '#e0c84a', 'systems|suffocation|charts'],
  ['project-zomboid', 'Project Zomboid', 2013, 'survival', '#141610', '#3a4424', '#c07a3a', 'this-is-how-you-died|slow|brutal'],
  ['subnautica', 'Subnautica', 2018, 'survival', '#0c1a24', '#1a5a7a', '#4ad0c0', 'thalassophobia|wonder|scary'],
  ['the-forest', 'The Forest', 2018, 'survival', '#101610', '#2a4a2a', '#c8a860', 'creepy|co-op|building'],
  ['grounded', 'Grounded', 2022, 'survival', '#141c12', '#3a6a2a', '#e0c84a', 'arachnophobia-mode|co-op|scale'],
  ['green-hell', 'Green Hell', 2019, 'survival', '#101610', '#2a5a2a', '#c8b040', 'sanity|parasites|harsh'],
  ['raft', 'Raft', 2022, 'survival', '#101c24', '#2a7a8a', '#e0d8a0', 'co-op|chill|shark'],
  ['astroneer', 'Astroneer', 2019, 'sandbox', '#1a1424', '#5a3a7a', '#f0c060', 'cute|co-op|terrain'],
  ['dyson-sphere-program', 'Dyson Sphere Program', 2021, 'sim', '#101824', '#2a4a7a', '#f0d840', 'scale|automation|awe'],
  ['stellaris', 'Stellaris', 2016, 'strategy', '#101424', '#2a3a7a', '#c8a8f0', 'sprawling|mid-game-slump|lore'],
  ['hearts-of-iron-4', 'Hearts of Iron IV', 2016, 'strategy', '#141410', '#3a3a2a', '#c8a040', 'divisions|micromanagement|history'],
  ['europa-universalis-4', 'Europa Universalis IV', 2013, 'strategy', '#141814', '#3a4a3a', '#c8b060', 'dlc-sprawl|mana|blobbing'],
  ['victoria-3', 'Victoria 3', 2022, 'strategy', '#1a1414', '#5a3a3a', '#d8b060', 'economics|graphs|pops'],
];

export const GAMES: Game[] = RAW.map(([slug, title, year, genre, deep, mid, accent, tags]) => ({
  slug,
  title,
  year,
  genre,
  colors: [deep, mid, accent],
  tags: tags.split('|'),
}));

const BY_SLUG = new Map(GAMES.map((g) => [g.slug, g]));

/** A stand-in used when a stored slug is no longer in the catalogue. */
export const UNKNOWN_GAME: Game = {
  slug: 'unknown',
  title: 'Unlisted Title',
  year: 0,
  genre: 'action',
  colors: ['#1a1014', '#5a2a3a', '#c88a9a'],
  tags: ['delisted'],
};

export function getGame(slug: string): Game {
  return BY_SLUG.get(slug) ?? UNKNOWN_GAME;
}

export function searchGames(term: string, limit = 40): Game[] {
  const q = term.trim().toLowerCase();
  if (!q) return GAMES.slice(0, limit);
  const hits = GAMES.filter(
    (g) => g.title.toLowerCase().includes(q) || g.tags.some((t) => t.includes(q)),
  );
  // Prefer titles that start with the query.
  hits.sort((a, b) => {
    const as = a.title.toLowerCase().startsWith(q) ? 0 : 1;
    const bs = b.title.toLowerCase().startsWith(q) ? 0 : 1;
    return as - bs || a.title.localeCompare(b.title);
  });
  return hits.slice(0, limit);
}

export const GAME_COUNT = GAMES.length;
