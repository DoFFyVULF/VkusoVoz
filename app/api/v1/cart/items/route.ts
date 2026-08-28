import { NextRequest } from "next/server";
import { ok, validationFail, unauthorized, handleUnknown } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { addItemSchema } from "@/lib/validators/cart";
import { addToCart } from "@/lib/server/cart-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await req.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) return validationFail(parsed.error);
    const cart = await addToCart(session.id, parsed.data);
    return ok(cart, { status: 201 });
  } catch (e) {
    return handleUnknown(e);
  }
}
