import { NextRequest } from "next/server";
import { ok, validationFail, unauthorized, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { checkoutSchema } from "@/lib/validators/order";
import { createOrder } from "@/lib/server/order-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return validationFail(parsed.error);
    const res = await createOrder(parsed.data, session.id);
    return ok(res, { status: 201 });
  } catch (e) {
    return handleUnknown(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 20)));
    try {
      const [items, total] = await Promise.all([
        prisma.order.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { items: true, restaurant: { select: { id: true, name: true, slug: true } } } }),
        prisma.order.count({ where: { userId: session.id } }),
      ]);
      return ok({ items, total, page, limit, pages: Math.ceil(total / limit) });
    } catch {
      return ok({ items: [], total: 0, page, limit, pages: 0 });
    }
  } catch (e) {
    return handleUnknown(e);
  }
}
