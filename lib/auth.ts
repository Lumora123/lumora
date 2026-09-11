import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db, save, verifyPassword } from "@/lib/db";
import type { PublicUser, User } from "@/lib/types";

export const SESSION_COOKIE = "lumora_session";
const SESSION_DAYS = 30;

export function toPublicUser(u: User): PublicUser {
  return { id: u.id, email: u.email, name: u.name, role: u.role, avatarSeed: u.avatarSeed, createdAt: u.createdAt };
}

export function createSession(userId: string): string {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  db().sessions[token] = {
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_DAYS * 86400000).toISOString(),
  };
  save();
  return token;
}

export function destroySession(token: string) {
  const d = db();
  if (d.sessions[token]) {
    delete d.sessions[token];
    save();
  }
}

export function getSessionUser(): User | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const sess = db().sessions[token];
  if (!sess) return null;
  if (new Date(sess.expiresAt).getTime() < Date.now()) {
    destroySession(token);
    return null;
  }
  return db().users.find(u => u.id === sess.userId) ?? null;
}

export function requireUser(): User {
  const u = getSessionUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}

export function login(email: string, password: string): PublicUser | null {
  const user = db().users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user)) return null;
  const token = createSession(user.id);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return toPublicUser(user);
}

export function logout() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) destroySession(token);
  cookies().delete(SESSION_COOKIE);
}

export function signup(email: string, password: string, name: string): { user?: PublicUser; error?: string } {
  const d = db();
  const clean = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (d.users.some(u => u.email.toLowerCase() === clean)) return { error: "An account with this email already exists." };
  const { hashPassword } = require("@/lib/db") as typeof import("@/lib/db");
  const salt = randomBytes(16).toString("hex");
  const user: User = {
    id: `usr-${randomBytes(5).toString("hex")}`,
    email: clean,
    name: name.trim() || clean.split("@")[0],
    salt,
    passwordHash: hashPassword(password, salt),
    role: "user",
    avatarSeed: clean.slice(0, 8),
    createdAt: new Date().toISOString(),
    resetToken: null,
    resetExpires: null,
  };
  d.users.push(user);
  save();
  const token = createSession(user.id);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return { user: toPublicUser(user) };
}
