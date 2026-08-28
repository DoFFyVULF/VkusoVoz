import { NextRequest } from "next/server";
import { ok, unauthorized, notFound, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = await params;
    try {
      const order = await prisma.order.findFirst({ where: { id, userId: session.id }, include: { items: { include: { options: true } }, statusHistory: true, restaurant: true, address: true, payment: true } });
      if (order) return ok(order);
    } catch {}
    return notFound("Заказ не найден");
  } catch (e) {
    return handleUnknown(e);
  }
}
