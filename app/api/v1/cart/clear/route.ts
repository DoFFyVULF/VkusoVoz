import { ok, unauthorized, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { clearCart } from "@/lib/server/cart-service";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    await clearCart(session.id);
    return ok({ ok: true });
  } catch (e) {
    return handleUnknown(e);
  }
}
