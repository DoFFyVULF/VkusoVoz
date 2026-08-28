import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, unauthorized, validationFail, notFound, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({ status: z.enum(["ACTIVE", "BLOCKED", "PAUSED", "PENDING_MODERATION"]).optional(), isActive: z.boolean().optional() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (session.role !== "ADMIN") return unauthorized("Доступ запрещён");
    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return validationFail(parsed.error);
    try {
      const updated = await prisma.restaurant.update({ where: { id }, data: parsed.data as never });
      return ok(updated);
    } catch {
      return notFound("Ресторан не найден");
    }
  } catch (e) {
    return handleUnknown(e);
  }
}
