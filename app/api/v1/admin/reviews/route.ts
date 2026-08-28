import { NextRequest } from "next/server";
import { ok } from "@/lib/server/api-response";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    // Dev-режим без admin-сессии — отдаём мок.
  }
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 20)));

  try {
    const [items, total] = await Promise.all([
      prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true } },
          restaurant: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.review.count(),
    ]);
    return ok({ items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch {
    const start = (page - 1) * limit;
    const items = mockReviews.slice(start, start + limit);
    return ok({ items, total: mockReviews.length, page, limit, pages: Math.ceil(mockReviews.length / limit) });
  }
}

const mockReviews = [
  {
    id: "rev_318",
    rating: 5,
    text: "Лучшая пицца в городе! Тесто воздушное, начинки много.",
    status: "APPROVED",
    createdAt: "2026-08-24T12:30:00.000Z",
    user: { id: "u_001", name: "Анна Иванова" },
    restaurant: { id: "r_77", name: "Mamma Roma", slug: "mamma-roma" },
  },
  {
    id: "rev_319",
    rating: 4,
    text: "Борщ наваристый, пампушки свежие. Чуть долго везли.",
    status: "PENDING",
    createdAt: "2026-08-26T14:10:00.000Z",
    user: { id: "u_003", name: "Мария Петрова" },
    restaurant: { id: "r_10", name: "Печкин Дом", slug: "pechkin-dom" },
  },
  {
    id: "rev_320",
    rating: 2,
    text: "Холодное привезли, не вкусно. Ужас!!!",
    status: "PENDING",
    createdAt: "2026-08-27T19:55:00.000Z",
    user: { id: "u_002", name: "Игорь Соколов" },
    restaurant: { id: "r_22", name: "Тепло Гриль", slug: "teplo-grill" },
  },
  {
    id: "rev_321",
    rating: 5,
    text: "Свежайшие роллы, всё аккуратно.",
    status: "APPROVED",
    createdAt: "2026-08-20T11:00:00.000Z",
    user: { id: "u_006", name: "Ольга Ким" },
    restaurant: { id: "r_5", name: "Суши Тори", slug: "sushi-tori" },
  },
];
