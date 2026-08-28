import { ok, unauthorized, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    if (!["COURIER", "ADMIN"].includes(session.role)) return unauthorized("Доступ запрещён");
    try {
      const items = await prisma.order.findMany({ where: { courierId: session.id }, orderBy: { createdAt: "desc" }, take: 50 });
      return ok({ items });
    } catch {
      return ok({ items: [] });
    }
  } catch (e) {
    return handleUnknown(e);
  }
}
