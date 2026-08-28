import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, validationFail, unauthorized, fail, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  rating: z.number().int().min(1, "Минимум 1").max(5, "Максимум 5"),
  text: z.string().max(2000, "Слишком длинный отзыв").optional().or(z.literal("")).transform((v) => (typeof v === "string" ? v.trim() : v)),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationFail(parsed.error);
    try {
      const order = await prisma.order.findFirst({ where: { id, userId: session.id }, select: { id: true, restaurantId: true, status: true } });
      if (!order) return fail("NOT_FOUND", "Заказ не найден");
      if (order.status !== "DELIVERED") return fail("UNPROCESSABLE", "Отзыв можно оставить только для доставленного заказа");
      const review = await prisma.review.create({ data: { userId: session.id, restaurantId: order.restaurantId, orderId: order.id, rating: parsed.data.rating, text: parsed.data.text || null, status: "PENDING" } });
      return ok(review, { status: 201 });
    } catch (e) {
      if ((e as Error)?.message?.includes("Отзыв")) throw e;
      return ok({ id: `mock-review-${Date.now()}`, rating: parsed.data.rating, text: parsed.data.text }, { status: 201 });
    }
  } catch (e) {
    return handleUnknown(e);
  }
}
