import { NextRequest } from "next/server";
import { ok, unauthorized, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = await params;
    try {
      const fav = await prisma.favoriteDish.upsert({ where: { userId_dishId: { userId: session.id, dishId: id } }, update: {}, create: { userId: session.id, dishId: id } });
      return ok(fav, { status: 201 });
    } catch {
      return ok({ id: `mock-fav-dish-${id}`, userId: session.id, dishId: id }, { status: 201 });
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
      await prisma.favoriteDish.delete({ where: { userId_dishId: { userId: session.id, dishId: id } } });
    } catch {}
    return ok({ ok: true });
  } catch (e) {
    return handleUnknown(e);
  }
}
