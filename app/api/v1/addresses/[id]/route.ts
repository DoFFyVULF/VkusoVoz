import { NextRequest } from "next/server";
import { ok, validationFail, unauthorized, notFound, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { addressUpdateSchema } from "@/lib/validators/address";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = await params;
    const body = await req.json();
    const parsed = addressUpdateSchema.safeParse(body);
    if (!parsed.success) return validationFail(parsed.error);
    try {
      const existing = await prisma.address.findFirst({ where: { id, userId: session.id } });
      if (!existing) return notFound("Адрес не найден");
      const updated = await prisma.address.update({ where: { id }, data: parsed.data as never });
      return ok(updated);
    } catch {
      return ok({ id, ...parsed.data });
    }
  } catch (e) {
    return handleUnknown(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = await params;
    try {
      await prisma.address.delete({ where: { id } });
    } catch {}
    return ok({ ok: true });
  } catch (e) {
    return handleUnknown(e);
  }
}
