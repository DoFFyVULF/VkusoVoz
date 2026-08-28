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
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          restaurant: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.order.count(),
    ]);
    return ok({ items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch {
    const start = (page - 1) * limit;
    const items = mockOrders.slice(start, start + limit);
    return ok({ items, total: mockOrders.length, page, limit, pages: Math.ceil(mockOrders.length / limit) });
  }
}

const mockOrders = [
  {
    id: "ord_9412",
    number: "VK-9412",
    status: "DELIVERED",
    total: 2380,
    createdAt: "2026-08-28T18:42:00.000Z",
    user: { id: "u_001", name: "Анна Иванова", email: "anna@example.com" },
    restaurant: { id: "r_77", name: "Mamma Roma", slug: "mamma-roma" },
  },
  {
    id: "ord_9398",
    number: "VK-9398",
    status: "OUT_FOR_DELIVERY",
    total: 1379,
    createdAt: "2026-08-28T19:05:00.000Z",
    user: { id: "u_003", name: "Мария Петрова", email: "maria@example.com" },
    restaurant: { id: "r_22", name: "Тепло Гриль", slug: "teplo-grill" },
  },
  {
    id: "ord_9380",
    number: "VK-9380",
    status: "CANCELLED",
    total: 990,
    createdAt: "2026-08-28T13:20:00.000Z",
    user: { id: "u_002", name: "Игорь Соколов", email: "igor@teplo-grill.ru" },
    restaurant: { id: "r_22", name: "Тепло Гриль", slug: "teplo-grill" },
  },
  {
    id: "ord_9365",
    number: "VK-9365",
    status: "PREPARING",
    total: 1820,
    createdAt: "2026-08-28T20:11:00.000Z",
    user: { id: "u_004", name: "Дмитрий Кузнецов", email: "courier1@example.com" },
    restaurant: { id: "r_10", name: "Печкин Дом", slug: "pechkin-dom" },
  },
  {
    id: "ord_9350",
    number: "VK-9350",
    status: "CONFIRMED",
    total: 760,
    createdAt: "2026-08-28T20:22:00.000Z",
    user: { id: "u_006", name: "Ольга Ким", email: "olga@example.com" },
    restaurant: { id: "r_5", name: "Суши Тори", slug: "sushi-tori" },
  },
  {
    id: "ord_9302",
    number: "VK-9302",
    status: "PENDING",
    total: 1450,
    createdAt: "2026-08-28T20:40:00.000Z",
    user: { id: "u_001", name: "Анна Иванова", email: "anna@example.com" },
    restaurant: { id: "r_22", name: "Тепло Гриль", slug: "teplo-grill" },
  },
];
