/**
 * JSON-file backed database with an in-memory cache.
 *
 * [ASSUMPTION] For this build the persistence layer is a simple JSON store on
 * local disk (data/*.json). The repository surface (`db()`, `save()`) is the
 * only place storage is touched, so swapping in PostgreSQL via Prisma/Drizzle
 * is a single-file change in production. Sessions, users, watchlists and
 * progress all live here.
 *
 * Serverless note (Vercel): the project filesystem is read-only and only /tmp
 * is writable, and /tmp survives only while the lambda container is warm. On
 * Vercel the store therefore behaves as "seeded demo data + best-effort
 * persistence": browsing, playback and seeded demo accounts always work;
 * sign-ups and library changes persist across warm requests but reset when a
 * cold container boots. Set LUMORA_DATA_DIR to point at a real volume (or
 * swap in a managed DB here) for durable persistence.
 */
import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { DBShape, HomeSectionConfig, Title, User, UserData } from "@/lib/types";
import { allTitles, homeSections, seedUsers, demoUserState } from "@/lib/seed";

const IS_SERVERLESS = !!process.env.VERCEL;

function resolveDataDir(): string {
  if (process.env.LUMORA_DATA_DIR) return process.env.LUMORA_DATA_DIR;
  if (IS_SERVERLESS) return "/tmp/lumora-data";
  return join(process.cwd(), "data");
}

let DATA_DIR = resolveDataDir();
let DB_FILE = join(DATA_DIR, "db.json");

export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password: string, user: Pick<User, "salt" | "passwordHash">): boolean {
  const h = Buffer.from(hashPassword(password, user.salt), "hex");
  const t = Buffer.from(user.passwordHash, "hex");
  return h.length === t.length && timingSafeEqual(h, t);
}

function freshDB(): DBShape {
  const users: User[] = seedUsers.map(u => {
    const salt = randomBytes(16).toString("hex");
    return {
      id: `usr-${createHash("sha256").update(u.email).digest("hex").slice(0, 10)}`,
      email: u.email,
      name: u.name,
      salt,
      passwordHash: hashPassword(u.password, salt),
      role: u.role,
      avatarSeed: u.avatarSeed,
      createdAt: new Date().toISOString(),
      resetToken: null,
      resetExpires: null,
    };
  });
  const db: DBShape = {
    titles: allTitles as Title[],
    users,
    sessions: {},
    userData: {},
    sections: homeSections as HomeSectionConfig[],
    meta: { seededAt: new Date().toISOString(), version: 1 },
  };
  // Seed the demo account with activity so personalization rails are alive.
  const demo = users.find(u => u.email === "demo@lumora.tv")!;
  const now = new Date().toISOString();
  db.userData[demo.id] = {
    userId: demo.id,
    watchlist: demoUserState.watchlist,
    progress: Object.fromEntries(
      demoUserState.progress.map(p => [p.key, { ...p, updatedAt: now }])
    ),
    history: demoUserState.history.map((h, i) => {
      if (h.startsWith("mov-")) {
        const t = allTitles.find(x => x.id === h)!;
        return { titleId: t.id, kind: t.kind, slug: t.slug, at: new Date(Date.now() - i * 36e5 * 5).toISOString() };
      }
      if (h === "tv:dragnet:s1e1") {
        return { titleId: "tv-dragnet", kind: "tv" as const, slug: "dragnet", at: new Date(Date.now() - 36e5 * 8).toISOString() };
      }
      return { titleId: "mov-the-39-steps", kind: "movie" as const, slug: "the-39-steps", at: now };
    }),
  };
  return db;
}

let cache: DBShape | null = null;
let writeTimer: ReturnType<typeof setTimeout> | null = null;

function ensureDir(): boolean {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    return true;
  } catch {
    // Read-only filesystem (serverless without /tmp, or restricted host):
    // fall back to the writable temp dir.
    try {
      DATA_DIR = "/tmp/lumora-data";
      DB_FILE = join(DATA_DIR, "db.json");
      mkdirSync(DATA_DIR, { recursive: true });
      return true;
    } catch {
      return false;
    }
  }
}

function load(): DBShape {
  if (cache) return cache;
  const writable = ensureDir();
  if (writable && existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(readFileSync(DB_FILE, "utf8")) as DBShape;
      if (parsed?.titles?.length) {
        cache = parsed;
        return cache;
      }
    } catch {
      // corrupted file — reseed below
    }
  }
  cache = freshDB();
  if (writable) persistNow();
  return cache;
}

function persistNow() {
  if (!cache) return;
  try {
    ensureDir();
    const tmp = DB_FILE + ".tmp";
    writeFileSync(tmp, JSON.stringify(cache));
    writeFileSync(DB_FILE, readFileSync(tmp)); // atomic-ish swap
  } catch (e) {
    console.error("[db] persist failed", e);
  }
}

export function db(): DBShape {
  return load();
}

/**
 * Persist with a small debounce so bursts of writes coalesce. On serverless
 * the debounce is skipped: the container can freeze between invocations and a
 * pending timer would never fire, silently dropping the write.
 */
export function save() {
  if (IS_SERVERLESS) {
    persistNow();
    return;
  }
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(persistNow, 120);
}

export function ensureUserData(userId: string): UserData {
  const d = db();
  if (!d.userData[userId]) {
    d.userData[userId] = { userId, watchlist: [], progress: {}, history: [] };
    save();
  }
  return d.userData[userId];
}
