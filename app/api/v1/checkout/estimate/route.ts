import { NextRequest } from "next/server";
import { ok, validationFail, handleUnknown, unauthorized } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { checkoutSchema } from "@/lib/validators/order";
import { estimateOrder } from "@/lib/server/order-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return validationFail(parsed.error);
    const session = await getSession();
    const isAuthed = !!session && !session.id.startsWith("mock-");
    if (parsed.data.promoCode && !isAuthed) return unauthorized("Войдите, чтобы применить промокод");
    const est = await estimateOrder(parsed.data, session?.id);
    return ok(est);
  } catch (e) {
    return handleUnknown(e);
  }
}
