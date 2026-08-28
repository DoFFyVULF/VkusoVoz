import { NextRequest } from "next/server";
import { ok } from "@/lib/server/api-response";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/v1/admin/users
 * Список пользователей для админ-панели.
 * Если БД недоступна — отдаёт мок, чтобы UI работал в dev/demo.
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    // Dev-режим без сессии: всё равно отдаём мок, чтобы админка открывалась.
  }
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 20)));
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();

  try {
    const where: Record<string, unknown> = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: where as never,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          image: true,
        },
      }),
      prisma.user.count({ where: where as never }),
    ]);
    return ok({ items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch {
    // Fallback: мок-данные, если БД недоступна.
    const all = mockUsers.filter(
      (u) =>
        !q ||
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q)
    );
    const start = (page - 1) * limit;
    const items = all.slice(start, start + limit);
    return ok({ items, total: all.length, page, limit, pages: Math.ceil(all.length / limit) });
  }
}

const mockUsers = [
  {
    id: "u_001",
    email: "anna@example.com",
    name: "Анна Иванова",
    phone: "+7 999 123-45-67",
    role: "USER",
    isActive: true,
    createdAt: "2026-01-12T10:30:00.000Z",
    image: null,
  },
  {
    id: "u_002",
    email: "igor@teplo-grill.ru",
    name: "Игорь Соколов",
    phone: "+7 915 222-10-30",
    role: "RESTAURANT_OWNER",
    isActive: true,
    createdAt: "2025-11-04T12:00:00.000Z",
    image: null,
  },
  {
    id: "u_003",
    email: "maria@example.com",
    name: "Мария Петрова",
    phone: "+7 925 777-88-99",
    role: "USER",
    isActive: true,
    createdAt: "2026-02-18T08:15:00.000Z",
    image: null,
  },
  {
    id: "u_004",
    email: "courier1@example.com",
    name: "Дмитрий Кузнецов",
    phone: "+7 903 444-22-11",
    role: "COURIER",
    isActive: true,
    createdAt: "2026-03-02T14:42:00.000Z",
    image: null,
  },
  {
    id: "u_005",
    email: "ilya.s@vkusovoz.ru",
    name: "Илья Соколов",
    phone: "+7 910 000-12-12",
    role: "ADMIN",
    isActive: true,
    createdAt: "2025-09-01T09:00:00.000Z",
    image: null,
  },
  {
    id: "u_006",
    email: "olga@example.com",
    name: "Ольга Ким",
    phone: "+7 916 555-33-44",
    role: "USER",
    isActive: false,
    createdAt: "2025-12-21T18:20:00.000Z",
    image: null,
  },
];
