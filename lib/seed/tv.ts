import { IA } from "./util";
import type { AudioTrack, Episode, Season, StreamingSource, Title, TrailerSpec } from "@/lib/types";

const PD_TV_NOTE =
  "Public-domain television episodes streamed from the Internet Archive's public-domain collection.";

type EpSeed = [
  season: number,
  number: number,
  title: string,
  file: string,
  height: number,
  length: number,
  synopsis: string
];

function buildSeasons(slug: string, archiveId: string, eps: EpSeed[]): Season[] {
  const bySeason = new Map<number, Episode[]>();
  for (const [s, n, title, file, height, length, synopsis] of eps) {
    if (!bySeason.has(s)) bySeason.set(s, []);
    const id = `${slug}-s${s}e${n}`;
    bySeason.get(s)!.push({
      id,
      season: s,
      number: n,
      title,
      synopsis,
      runtime: Math.round(length),
      streamingSources: [
        {
          id: `${id}-src`,
          quality: `${height}p`,
          height,
          type: "mp4",
          url: IA(archiveId, file),
          rights: "public-domain",
        },
      ],
      subtitles: [],
      audioTracks: [{ id: "aud-en", lang: "en", label: "English (Original)", default: true }],
    });
  }
  return [...bySeason.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([number, episodes]) => ({ number, episodes: episodes.sort((a, b) => a.number - b.number) }));
}

function series(cfg: {
  slug: string;
  title: string;
  tagline?: string;
  synopsis: string;
  year: number;
  endYear?: number;
  genres: string[];
  rating: number;
  popularity: number;
  contentRating: string;
  creators?: string[];
  director?: string;
  cast: { name: string; role?: string }[];
  languages?: string[];
  countries?: string[];
  archiveId: string;
  episodes: EpSeed[];
  trailerStart?: number;
  featured?: boolean;
  trending?: boolean;
  newRelease?: boolean;
  topRated?: boolean;
  lumoraPick?: boolean;
  daysAgo?: number;
}): Title {
  const seasons = buildSeasons(cfg.slug, cfg.archiveId, cfg.episodes);
  const allEps = seasons.flatMap(s => s.episodes);
  const avgRuntime = Math.round(allEps.reduce((a, e) => a + e.runtime, 0) / allEps.length);
  const firstSrc = allEps[0].streamingSources[0];
  const trailer: TrailerSpec = { kind: "clip", sourceId: firstSrc.id, start: cfg.trailerStart ?? 60, duration: 30 };
  // Series-level "sources" are empty on purpose: playback happens per episode.
  const created = new Date(Date.now() - (cfg.daysAgo ?? 20) * 86400000).toISOString();
  return {
    id: `tv-${cfg.slug}`,
    kind: "tv",
    title: cfg.title,
    slug: cfg.slug,
    tagline: cfg.tagline,
    synopsis: cfg.synopsis,
    trailer,
    releaseDate: `${cfg.year}-01-01`,
    year: cfg.year,
    runtime: avgRuntime,
    genres: cfg.genres,
    languages: cfg.languages ?? ["en"],
    countries: cfg.countries ?? ["US"],
    rating: cfg.rating,
    popularity: cfg.popularity,
    cast: cfg.cast,
    director: cfg.director,
    creators: cfg.creators,
    contentRating: cfg.contentRating,
    streamingSources: [],
    subtitles: [],
    audioTracks: [{ id: "aud-en", lang: "en", label: "English (Original)", default: true }],
    featured: !!cfg.featured,
    trending: !!cfg.trending,
    flags: { newRelease: cfg.newRelease, topRated: cfg.topRated ?? cfg.rating >= 7.7, lumoraPick: cfg.lumoraPick },
    seasons,
    rightsNote: PD_TV_NOTE,
    contentTier: "production",
    createdAt: created,
    updatedAt: created,
  };
}

/* ---------------- Dragnet (1951–1959) ---------------- */
const DRAGNET: EpSeed[] = [
  [1, 1, "The Human Bomb", "Dragnet/Season 1/Dragnet (1951) - S01E01 - The Human Bomb.mp4", 240, 1559, "A disgruntled ex-employee straps on explosives and takes an office full of hostages; Friday talks him down with seconds on the clock."],
  [1, 2, "The Big Actor", "Dragnet/Season 1/Dragnet (1951) - S01E02 - The Big Actor.mp4", 240, 1536, "A bitter, failed actor's jealousy curdles into murder, and Friday searches the small-time theatre world for a killer craving applause."],
  [1, 5, "The Big Cast", "Dragnet/Season 1/Dragnet (1951) - S01E05 - The Big Cast.mp4", 360, 1476, "An elderly man witnesses a robbery-homicide but can't recall the killer's face; Friday patiently draws the truth from a fading memory."],
  [1, 11, "The Big September Man", "Dragnet/Season 1/Dragnet (1951) - S01E11 - The Big September Man.mp4", 240, 1568, "A prosperous businessman is found dead, and the case unravels a tangle of blackmail and quiet desperation."],
  [1, 12, "The Big Phone Call", "Dragnet/Season 1/Dragnet (1951) - S01E12 - The Big Phone Call.mp4", 240, 1540, "Threatening phone calls to a frightened woman escalate toward murder; Friday traces the caller before the line goes dead."],
  [1, 13, "The Big Chasing", "Dragnet/Season 1/Dragnet (1951) - S01E13 - The Big Chasing.mp4", 240, 1559, "A stolen car leads to a robbery suspect, and Friday and his partner chase him through the city's back streets."],
  [1, 14, "The Big Lamp", "Dragnet/Season 1/Dragnet (1951) - S01E14 - The Big Lamp.mp4", 240, 1540, "A watchman's stolen lantern becomes the key clue in a string of warehouse burglaries."],
  [2, 1, "The Big Jump", "Dragnet/Season 2/Dragnet (1951) - S02E01 - The Big Jump.mp4", 360, 1539, "The death of a narcotics courier leads Friday to a pusher ring operating behind a candy store counter."],
  [2, 2, "The Big Sorrow", "Dragnet/Season 2/Dragnet (1951) - S02E02 - The Big Sorrow.mp4", 480, 1487, "A policeman is shot in the line of duty; the department hunts his killer while a young widow grieves."],
  [2, 4, "The Big Seventeen", "Dragnet/Season 2/Dragnet (1951) - S02E04 - The Big Seventeen.mp4", 240, 1587, "A teenage pusher hides behind a clean-cut face, and Friday works a juvenile narcotics trail to its adult suppliers."],
  [2, 7, "The Big .22 Rifle for Christmas", "Dragnet/Season 2/Dragnet (1951) - S02E07 - The Big .22 Rifle for Christmas.mp4", 480, 1761, "A .22 rifle bought as a Christmas gift is tied to a holdup homicide."],
  [2, 9, "The Big Grandma", "Dragnet/Season 2/Dragnet (1951) - S02E09 - The Big Grandma.mp4", 240, 1511, "An elderly woman's murder exposes the quiet empire of a neighbourhood loan shark."],
  [2, 11, "The Big Show", "Dragnet/Season 2/Dragnet (1951) - S02E11 - The Big Show.mp4", 240, 1590, "A stagehand's death at a local theatre points Friday toward the secrets backstage."],
  [2, 14, "The Big Hate", "Dragnet/Season 2/Dragnet (1951) - S02E14 - The Big Hate.mp4", 480, 1564, "A labour dispute boils over into a bombing, and Friday looks for the source of the hate."],
  [2, 18, "The Big Run", "Dragnet/Season 2/Dragnet (1951) - S02E18 - The Big Run.mp4", 240, 1575, "A hit-and-run leaves a man dying in the street; the car is the only witness."],
  [2, 19, "The Big Break", "Dragnet/Season 2/Dragnet (1951) - S02E19 - The Big Break.mp4", 240, 1582, "A prison escapee returns to Los Angeles to finish what he started, and Friday sets the net."],
  [2, 20, "The Big Light", "Dragnet/Season 2/Dragnet (1951) - S02E20 - The Big Light.mp4", 480, 1595, "A blackout masks a jewellery-store robbery; Friday reconstructs the crime in the dark."],
  [2, 22, "The Big Test", "Dragnet/Season 2/Dragnet (1951) - S02E22 - The Big Test.mp4", 360, 1576, "A narcotics buy goes wrong and a young informer's nerve is tested."],
  [2, 26, "The Big Frank", "Dragnet/Season 2/Dragnet (1951) - S02E26 - The Big Frank.mp4", 240, 1494, "A small-time crook is suspected in a series of burglaries; Friday waits for him to make one mistake."],
  [2, 27, "The Big Lease", "Dragnet/Season 2/Dragnet (1951) - S02E27 - The Big Lease.mp4", 480, 1564, "A car-rental agency becomes an unwitting front for getaway vehicles."],
  [2, 28, "The Big Hands", "Dragnet/Season 2/Dragnet (1951) - S02E28 - The Big Hands.mp4", 360, 1476, "A shopkeeper is strangled by a man with distinctive hands; a palm print leads the way."],
  [2, 32, "The Big Barrette", "Dragnet/Season 2/Dragnet (1951) - S02E32 - The Big Barrette.mp4", 360, 1583, "An ornamental hairpin at a murder scene links to a missing woman."],
  [2, 33, "The Big Dance", "Dragnet/Season 2/Dragnet (1951) - S02E33 - The Big Dance.mp4", 480, 1567, "A night-club dancer is killed after her last set; Friday works the club's regulars."],
  [3, 4, "The Big Betty", "Dragnet/Season 3/Dragnet (1951) - S03E04 - The Big Betty.mp4", 360, 1585, "A woman with several identities bilks lonely men of their savings."],
  [3, 16, "The Big Thief", "Dragnet/Season 3/Dragnet (1951) - S03E16 - The Big Thief.mp4", 240, 1636, "A cat burglar robs houses while their owners sleep; Friday hunts a ghost with a lockpick."],
  [3, 19, "The Big Trunk", "Dragnet/Season 3/Dragnet (1951) - S03E19 - The Big Trunk.mp4", 240, 1580, "A body in a car trunk leads to a motel registration and a jealous lover."],
  [3, 22, "The Big Ham", "Dragnet/Season 3/Dragnet (1951) - S03E22 - The Big Ham.mp4", 480, 1569, "A butcher-shop owner's murder exposes a gambling debt."],
  [3, 24, "The Big Children", "Dragnet/Season 3/Dragnet (1951) - S03E24 - The Big Children.mp4", 240, 1571, "Neglected children witness a crime at home; Friday works gently around their fear."],
  [3, 27, "The Big Winchester", "Dragnet/Season 3/Dragnet (1951) - S03E27 - The Big Winchester.mp4", 480, 1566, "A rifle mailed in from out of state is used in a revenge killing."],
  [3, 28, "The Big Shoplift", "Dragnet/Season 3/Dragnet (1951) - S03E28 - The Big Shoplift.mp4", 240, 1618, "A routine shoplifting arrest uncovers a fence ring moving stolen goods downtown."],
  [3, 29, "The Big Hit-Run Killer", "Dragnet/Season 3/Dragnet (1951) - S03E29 - The Big Hit-Run Killer.mp4", 240, 1583, "A hit-and-run kills a young mother; Friday combs collision reports for a dented fender."],
  [3, 31, "The Big Girl", "Dragnet/Season 3/Dragnet (1951) - S03E31 - The Big Girl.mp4", 240, 1580, "A con man preys on young women — until one of them fights back."],
  [3, 34, "The Big Frame", "Dragnet/Season 3/Dragnet (1951) - S03E34 - The Big Frame.mp4", 240, 1582, "Planted evidence nearly convicts the wrong man; Friday doubts the neatness of the case."],
  [3, 35, "The Big Plant", "Dragnet/Season 3/Dragnet (1951) - S03E35 - The Big Plant.mp4", 240, 1579, "An informer's tip leads to a marijuana crop growing under lights in a greenhouse."],
  [4, 1, "The Big Producer", "Dragnet/Season 4/Dragnet (1951) - S04E01 - The Big Producer.mp4", 240, 1572, "A radio producer's double life includes extortion."],
  [4, 2, "The Big Fraud", "Dragnet/Season 4/Dragnet (1951) - S04E02 - The Big Fraud.mp4", 480, 1560, "An insurance-fraud scheme turns deadly when the 'victim' doesn't survive."],
  [4, 3, "The Big Crime", "Dragnet/Season 4/Dragnet (1951) - S04E03 - The Big Crime.mp4", 240, 1594, "A robbery crew graduates from corner stores to payrolls; Friday maps their pattern."],
  [4, 4, "The Big Pair", "Dragnet/Season 4/Dragnet (1951) - S04E04 - The Big Pair.mp4", 240, 1579, "Two brothers — one a cop, one a crook — collide in a narcotics case."],
  [4, 8, "The Big Bar", "Dragnet/Season 4/Dragnet (1951) - S04E08 - The Big Bar.mp4", 240, 1579, "A bartender's murder leads to a protection racket shaking down taverns."],
  [4, 9, "The Big Present", "Dragnet/Season 4/Dragnet (1951) - S04E09 - The Big Present.mp4", 480, 1551, "A pawned Christmas gift links to a robbery-homicide on the holiday beat."],
  [4, 12, "The Big New Year", "Dragnet/Season 4/Dragnet (1951) - S04E12 - The Big New Year.mp4", 480, 1543, "A fatal crash on New Year's Eve opens a homicide case among the party crowds."],
  [4, 18, "The Big Rod", "Dragnet/Season 4/Dragnet (1951) - S04E18 - The Big Rod.mp4", 240, 1561, "A hot-rodder is implicated in a canyon-road race that ends in death."],
  [5, 3, "The Big No Rain", "Dragnet/Season 5/Dragnet (1951) - S05E03 - The Big No Rain.mp4", 360, 1599, "A drought hustler sells phony rain insurance to farmers — until a policyholder dies."],
  [5, 4, "The Big Lift", "Dragnet/Season 5/Dragnet (1951) - S05E04 - The Big Lift.mp4", 240, 1581, "A flawless warehouse heist leaves only one loose end: a witness."],
  [5, 6, "The Big Gap", "Dragnet/Season 5/Dragnet (1951) - S05E06 - The Big Gap.mp4", 240, 1599, "A sniper's shot from a rooftop divides a neighbourhood into suspects."],
  [5, 7, "The Big Look", "Dragnet/Season 5/Dragnet (1951) - S05E07 - The Big Look.mp4", 240, 1583, "A prowler escalates from peeking to home invasion; Friday works the dark side of the block."],
  [5, 9, "The Big Bird", "Dragnet/Season 5/Dragnet (1951) - S05E09 - The Big Bird.mp4", 240, 1574, "A shipment of rare birds hides a narcotics drop."],
  [5, 11, "The Big Smoke", "Dragnet/Season 5/Dragnet (1951) - S05E11 - The Big Smoke.mp4", 360, 1587, "A fire at a chemical plant masks arson — and a body."],
  [5, 12, "The Big Bounce", "Dragnet/Season 5/Dragnet (1951) - S05E12 - The Big Bounce.mp4", 240, 1584, "A point-shaving scandal in college basketball leads to a gambler's murder."],
  [5, 13, "The Big Shot", "Dragnet/Season 5/Dragnet (1951) - S05E13 - The Big Shot.mp4", 240, 1648, "A photographer's murder exposes a blackmail operation run from his own darkroom."],
  [5, 23, "The Big Child", "Dragnet/Season 5/Dragnet (1951) - S05E23 - The Big Child.mp4", 240, 1572, "A kidnapped child is held for ransom; Friday beats the deadline."],
  [5, 34, "The Big Deal", "Dragnet/Season 5/Dragnet (1951) - S05E34 - The Big Deal.mp4", 240, 1578, "A used-car dealer washes money for a narcotics syndicate."],
  [5, 35, "The Big Wish", "Dragnet/Season 5/Dragnet (1951) - S05E35 - The Big Wish.mp4", 360, 1757, "A dying man's last wish reveals a robbery-homicide hidden for years."],
  [6, 12, "The Big Doting Mother", "Dragnet/Season 6/Dragnet (1951) - S06E12 - The Big Doting Mother.mp4", 240, 1532, "An over-protective mother shields her son from his own criminal past."],
  [7, 28, "The Big War", "Dragnet/Season 7/Dragnet (1951) - S07E28 - The Big War.mp4", 540, 1554, "A gang war between rival outfits spills into the streets; Friday walks the line between them."],
  [8, 4, "The Big Oskar", "Dragnet/Season 8/Dragnet (1951) - S08E04 - The Big Oskar.mp4", 240, 1552, "A safecracker named Oskar comes out of retirement for one last big score."],
];

export const dragnet = series({
  slug: "dragnet",
  title: "Dragnet",
  tagline: "Just the facts.",
  synopsis:
    "Sergeant Joe Friday of the Los Angeles Police Department works case after case with methodical patience — surveillance, fingerprints, interviews, and the dry narration that made the show a national institution. Jack Webb's landmark procedural set the template for every cop show that followed, presented here from its public-domain episode archive.",
  year: 1951,
  endYear: 1959,
  genres: ["crime", "drama", "mystery"],
  rating: 7.8,
  popularity: 93,
  contentRating: "TV-PG",
  creators: ["Jack Webb"],
  director: "Jack Webb",
  cast: [
    { name: "Jack Webb", role: "Sgt. Joe Friday" },
    { name: "Ben Alexander", role: "Officer Frank Smith" },
    { name: "Barton Yarborough", role: "Sgt. Ben Romero" },
    { name: "Harry Morgan", role: "Officer Bill Gannon" },
  ],
  archiveId: "Dragnet1951",
  episodes: DRAGNET,
  trailerStart: 40,
  featured: true,
  trending: true,
  topRated: true,
  daysAgo: 2,
});

/* ---------------- Flash Gordon (1936 serial) ---------------- */
const FLASH: EpSeed[] = [
  [1, 1, "The Planet of Peril", "Flash Gordon Ch01 The Planet of Peril.mp4", 360, 1176, "With the planet Mongo on a collision course with Earth, All-American athlete Flash Gordon, Dale Arden and Dr. Zarkov rocket into space toward a tyrant's world."],
  [1, 2, "The Tunnel of Terror", "Flash Gordon Ch02 The Tunnel of Terror.mp4", 360, 1196, "Captured by Ming's guards, the Earthlings are forced into a tunnel where something monstrous waits in the dark."],
  [1, 3, "Captured by Shark Men", "Flash Gordon Ch03 Captured by Shark Men.mp4", 360, 1194, "Dale is taken to the undersea kingdom of the Shark Men, where King Kala schemes for Ming's favour."],
  [1, 4, "Battling the Sea Beast", "Flash Gordon Ch04 Battling the Sea Beast.mp4", 360, 573, "A summoned sea beast is unleashed on the captives — and Flash must fight it with his bare hands."],
  [1, 5, "The Destroying Ray", "Flash Gordon Ch05 The Destroying Ray.mp4", 360, 1077, "Ming tests his disintegration ray while Flash and Zarkov plot an escape through the palace."],
  [1, 6, "Flaming Torture", "Flash Gordon Ch06 Flaming Torture.mp4", 360, 1079, "For defying Ming, Flash is sentenced to die beneath a descending flame — unless Dale surrenders."],
  [1, 7, "Shattering Doom", "Flash Gordon Ch07 Shattering Doom.mp4", 360, 1091, "An earthquake bomb threatens Prince Barin's kingdom of Arboria, and Flash races to disarm it."],
  [1, 8, "Tournament of Death", "Flash Gordon Ch08 Tournament of Death.mp4", 360, 1011, "In Ming's gladiatorial games, Flash fights orange-skinned brutes for his life while Princess Aura plots."],
  [1, 9, "Fighting the Fire Dragon", "Flash Gordon Ch09 Fighting the Fire Dragon.mp4", 360, 916, "A trap in the dragon's lair tests Flash's courage — and Prince Barin's new loyalty."],
  [1, 10, "The Unseen Peril", "Flash Gordon Ch10 The Unseen Peril.mp4", 360, 1125, "An invisibility ray turns Ming's guards into unseen terrors stalking the palace corridors."],
  [1, 11, "In the Claws of the Tigron", "Flash Gordon Ch11 In the Claws of the Tigron.mp4", 360, 1083, "Flash faces the Tigron — a beast with a lion's head and a hawk's body — in Ming's pit of execution."],
  [1, 12, "Trapped in the Turret", "Flash Gordon Ch12 Trapped in the Turret.mp4", 360, 1074, "Flash and Dale are sealed in a tower with a rising death mechanism as rebellion flares across Mongo."],
  [1, 13, "Rocketing to Earth", "Flash Gordon Ch13 Rocketing to Earth.mp4", 360, 1191, "With Ming's empire collapsing around him, Flash makes his final bid to save Earth and bring everyone home."],
];

export const flashGordon = series({
  slug: "flash-gordon",
  title: "Flash Gordon",
  tagline: "The serial that defined space adventure.",
  synopsis:
    "Polo star Flash Gordon, journalist Dale Arden and scientist Dr. Zarkov travel to the planet Mongo to stop the tyrant Ming the Merciless from destroying Earth. Universal's lavishly produced 1936 chapter play — recycled sets from The Mummy, an orchestra on the score — became the blueprint for Star Wars and every space opera after it.",
  year: 1936,
  genres: ["scifi", "action", "adventure"],
  rating: 7.0,
  popularity: 81,
  contentRating: "TV-G",
  creators: ["Alex Raymond (comic strip)"],
  director: "Frederick Stephani, Ray Taylor",
  cast: [
    { name: "Buster Crabbe", role: "Flash Gordon" },
    { name: "Jean Rogers", role: "Dale Arden" },
    { name: "Charles Middleton", role: "Ming the Merciless" },
    { name: "Frank Shannon", role: "Dr. Zarkov" },
    { name: "Priscilla Lawson", role: "Princess Aura" },
  ],
  archiveId: "flash-gordon-serial",
  episodes: FLASH,
  trailerStart: 30,
  trending: true,
  lumoraPick: true,
  daysAgo: 4,
});

/* ---------------- The Phantom Creeps (1939 serial) ---------------- */
const CREEPS: EpSeed[] = [
  [1, 1, "The Menacing Power", "The Phantom Creeps Ch01 The Menacing Power.mp4", 480, 1265, "Mad scientist Dr. Alex Zorka demonstrates his meteorite-powered machines while foreign agents and G-men close in on his laboratory."],
  [1, 2, "Death Stalks the Highways", "The Phantom Creeps Ch02 Death Stalks the Highways.mp4", 480, 1229, "Zorka, invisible, stalks the highways as G-man Bob West follows the trail of the stolen meteor rock."],
  [1, 3, "Crashing Towers", "The Phantom Creeps Ch03 Crashing Towers.mp4", 480, 1286, "Zorka's revenge reaches the skyline as his disc brings a tower crashing down."],
  [1, 4, "Invisible Terror", "The Phantom Creeps Ch04 Invisible Terror.mp4", 480, 1239, "The invisibility belt turns a robbery into a ghost show, and the police chase a man who isn't there."],
  [1, 5, "Thundering Rails", "The Phantom Creeps Ch05 Thundering Rails.mp4", 480, 1286, "A train carrying the precious meteor rock races toward sabotage on the rails."],
  [1, 6, "The Iron Monster", "The Phantom Creeps Ch06 The Iron Monster.mp4", 480, 1279, "Zorka unleashes his towering robot — the Iron Monster — on a lakeside town."],
  [1, 7, "The Menacing Mist", "The Phantom Creeps Ch07 The Menacing Mist.mp4", 480, 1294, "A disintegrating gas turns everything it touches to dust, and the mist is spreading."],
  [1, 8, "Trapped in the Flames", "The Phantom Creeps Ch08 Trapped in the Flames.mp4", 480, 1145, "Zorka's enemies are cornered in a burning building as the walls close in."],
  [1, 9, "Speeding Doom", "The Phantom Creeps Ch09 Speeding Doom.mp4", 480, 1094, "A bomb aboard a speeding car leaves minutes to avert disaster."],
  [1, 10, "Phantom Footprints", "The Phantom Creeps Ch10 Phantom Footprints.mp4", 480, 1184, "Radioactive footprints lead the G-men to an underground hideout — and a trap."],
  [1, 11, "The Blast", "The Phantom Creeps Ch11 The Blast.mp4", 480, 1003, "An explosion rocks the waterfront as spies and G-men converge on Zorka's last secret."],
  [1, 12, "To Destroy the World", "The Phantom Creeps Ch12 To Destroy the World.mp4", 480, 1194, "Zorka's final plan: hold the entire world hostage with the power of the meteorite."],
];

export const phantomCreeps = series({
  slug: "the-phantom-creeps",
  title: "The Phantom Creeps",
  tagline: "Bela Lugosi's last great serial role.",
  synopsis:
    "Brilliant, unhinged Dr. Alex Zorka has invented machines of invisibility, giant robots and disintegration — and he'll sell them to no government on Earth. As foreign spies, newspaper reporters and G-men race to control his meteorite-powered arsenal, Zorka's inventions menace a world that cannot stop him. Universal's 1939 serial stars Bela Lugosi at full operatic menace.",
  year: 1939,
  genres: ["scifi", "horror", "action"],
  rating: 6.4,
  popularity: 66,
  contentRating: "TV-G",
  director: "Ford Beebe, Saul A. Goodkind",
  cast: [
    { name: "Bela Lugosi", role: "Dr. Alex Zorka" },
    { name: "Robert Kent", role: "Bob West" },
    { name: "Dorothy Arnold", role: "Jean Drew" },
    { name: "Edwin Stanley", role: "Amos Greer" },
  ],
  archiveId: "the-phantom-creeps",
  episodes: CREEPS,
  trailerStart: 30,
  daysAgo: 17,
});

/* ---------------- Betty Boop (1932–1937 shorts) ---------------- */
const BETTY: EpSeed[] = [
  [1, 1, "Is My Palm Read", "Betty_Boop_Is_My_Palm_Read_1932_512kb.mp4", 240, 395, "Betty assists a mystical palm reader whose crystal ball reveals a steamy island romance — and a very jealous villain."],
  [1, 2, "Betty Boop's Ker-Choo", "Betty_Boops_KerCho_1932_512kb.mp4", 240, 381, "A terrible cold sends Betty into a sneezing fit, and her friends rally with remedies, songs and chaos."],
  [1, 3, "A Song a Day", "Betty_Boop_A_Song_a_Day_1936_512kb.mp4", 240, 417, "Betty sings her way through the troubles of the day with a tune for every occasion."],
  [1, 4, "More Pep", "Betty_Boop_More_Pep_1936_512kb.mp4", 240, 335, "Betty brings song, dance and unstoppable pep to a sleepy workplace."],
  [1, 5, "The Candid Candidate", "The_Candid_Candidate_1937_512kb.mp4", 240, 363, "A case of mistaken identity lands Betty on the ballot — and she campaigns her way to an unlikely victory."],
];

export const bettyBoop = series({
  slug: "betty-boop",
  title: "Betty Boop Classics",
  tagline: "Boop-boop-a-doop.",
  synopsis:
    "The jazz-age flapper who became animation's first true star. Max Fleischer's Betty Boop shorts blend vaudeville, surreal gags and hot music into something no other cartoon studio dared make — collected here from the public-domain entries of her 1930s run.",
  year: 1932,
  endYear: 1937,
  genres: ["animation", "comedy", "family"],
  rating: 7.1,
  popularity: 63,
  contentRating: "TV-G",
  creators: ["Max Fleischer", "Grim Natwick"],
  cast: [{ name: "Mae Questel", role: "Betty Boop (voice)" }],
  archiveId: "BettyBoopCartoons",
  episodes: BETTY,
  trailerStart: 10,
  newRelease: true,
  daysAgo: 6,
});

export const tvShows: Title[] = [dragnet, flashGordon, phantomCreeps, bettyBoop];
