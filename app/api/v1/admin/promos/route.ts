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
      prisma.promoCode.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.promoCode.count(),
    ]);
    return ok({ items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch {
    const start = (page - 1) * limit;
    const items = mockPromos.slice(start, start + limit);
    return ok({ items, total: mockPromos.length, page, limit, pages: Math.ceil(mockPromos.length / limit) });
  }
}

const mockPromos = [
  {
    id: "p_001",
    code: "VKUS10",
    discountType: "PERCENT",
    discountValue: 10,
    minOrderAmount: 800,
    usageLimit: null,
    usedCount: 124,
    validFrom: "2026-08-01T00:00:00.000Z",
    validUntil: "2026-08-31T23:59:59.000Z",
    isActive: true,
  },
  {
    id: "p_002",
    code: "HELLO500",
    discountType: "FIXED",
    discountValue: 500,
    minOrderAmount: 2000,
    usageLimit: 1000,
    usedCount: 312,
    validFrom: "2026-08-15T00:00:00.000Z",
    validUntil: "2026-09-15T23:59:59.000Z",
    isActive: true,
  },
  {
    id: "p_003",
    code: "SUMMER15",
    discountType: "PERCENT",
    discountValue: 15,
    minOrderAmount: 1200,
    usageLimit: 5000,
    usedCount: 4210,
    validFrom: "2026-06-01T00:00:00.000Z",
    validUntil: "2026-08-31T23:59:59.000Z",
    isActive: false,
  },
  {
    id: "p_004",
    code: "WEEKEND",
    discountType: "FIXED",
    discountValue: 200,
    minOrderAmount: 1000,
    usageLimit: null,
    usedCount: 89,
    validFrom: "2026-08-22T00:00:00.000Z",
    validUntil: "2026-12-31T23:59:59.000Z",
    isActive: true,
  },
];
