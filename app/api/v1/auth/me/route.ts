import { ok, unauthorized, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    try {
      const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, email: true, name: true, role: true, phone: true, image: true } });
      if (user) return ok(user);
    } catch {}
    return ok({ id: session.id, email: session.email, name: session.name, role: session.role, phone: session.phone ?? null, image: null });
  } catch (e) {
    return handleUnknown(e);
  }
}
