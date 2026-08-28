import "server-only";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApiException } from "./api-response";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "vkusovoz_session";
const MAX_AGE = Number(process.env.SESSION_MAX_AGE ?? 2592000);

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
};

function encodeSession(payload: SessionUser): string {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

function decodeSession(value: string): SessionUser | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as SessionUser;
    if (!parsed.id || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const v = store.get(COOKIE_NAME)?.value;
  if (!v) return null;
  if (v.startsWith("mock-")) {
    return { id: v, email: `${v}@mock.local`, name: "Гость", role: "USER" };
  }
  return decodeSession(v);
}

export function getSessionFromRequest(req: NextRequest): SessionUser | null {
  const v = req.cookies.get(COOKIE_NAME)?.value;
  if (!v) return null;
  if (v.startsWith("mock-")) return { id: v, email: `${v}@mock.local`, name: "Гость", role: "USER" };
  return decodeSession(v);
}

export async function requireAuth(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) throw new ApiException("UNAUTHORIZED", "Требуется авторизация");
  try {
    const user = await prisma.user.findUnique({ where: { id: s.id }, select: { id: true, isActive: true } });
    if (user && !user.isActive) throw new ApiException("FORBIDDEN", "Аккаунт заблокирован");
  } catch (e) {
    if (e instanceof ApiException) throw e;
  }
  return s;
}

export async function requireRole(roles: string[]): Promise<SessionUser> {
  const s = await requireAuth();
  if (!roles.includes(s.role)) throw new ApiException("FORBIDDEN", "Недостаточно прав");
  return s;
}

export async function requireAuthFromRequest(req: NextRequest): Promise<SessionUser> {
  const s = getSessionFromRequest(req);
  if (!s) throw new ApiException("UNAUTHORIZED", "Требуется авторизация");
  return s;
}

export { COOKIE_NAME };
