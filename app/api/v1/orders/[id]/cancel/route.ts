import { NextRequest } from "next/server";
import { ok, unauthorized, notFound, fail, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = await params;
    try {
      const order = await prisma.order.findFirst({ where: { id, userId: session.id } });
      if (!order) return notFound("Заказ не найден");
      if (!["PENDING", "CONFIRMED"].includes(order.status)) return fail("UNPROCESSABLE", "Заказ уже нельзя отменить");
      const updated = await prisma.order.update({ where: { id }, data: { status: "CANCELLED" } });
      await prisma.orderStatusHistory.create({ data: { orderId: id, fromStatus: order.status, toStatus: "CANCELLED", changedById: session.id } });
      return ok(updated);
    } catch (e) {
      if ((e as Error)?.message?.includes("нельзя отменить")) throw e;
      return fail("UNPROCESSABLE", "Отмена недоступна в демо-режиме");
    }
  } catch (e) {
    return handleUnknown(e);
  }
}
