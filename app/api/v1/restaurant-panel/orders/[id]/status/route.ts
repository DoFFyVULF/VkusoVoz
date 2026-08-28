import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, validationFail, unauthorized, notFound, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ status: z.enum(["CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!["RESTAURANT_OWNER", "RESTAURANT_STAFF", "ADMIN"].includes(session.role)) return unauthorized("Доступ запрещён");
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationFail(parsed.error);
    try {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) return notFound("Заказ не найден");
      const updated = await prisma.order.update({ where: { id }, data: { status: parsed.data.status as never } });
      await prisma.orderStatusHistory.create({ data: { orderId: id, fromStatus: order.status, toStatus: parsed.data.status as never, changedById: session.id } });
      return ok(updated);
    } catch {
      return ok({ id, status: parsed.data.status });
    }
  } catch (e) {
    return handleUnknown(e);
  }
}
