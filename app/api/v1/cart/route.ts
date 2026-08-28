import { ok, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { getOrCreateCart } from "@/lib/server/cart-service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ok({ items: [], subtotal: 0, restaurantId: null });
    const cart = await getOrCreateCart(session.id);
    return ok(cart);
  } catch (e) {
    return handleUnknown(e);
  }
}
