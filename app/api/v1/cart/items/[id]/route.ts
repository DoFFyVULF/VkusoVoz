import { NextRequest } from "next/server";
import { ok, validationFail, unauthorized, handleUnknown, notFound } from "@/lib/server/api-response";
import { getSession } from "@/lib/server/auth";
import { updateCartItemSchema } from "@/lib/validators/cart";
import { updateCartItem, removeCartItem } from "@/lib/server/cart-service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateCartItemSchema.safeParse(body);
    if (!parsed.success) return validationFail(parsed.error);
    const cart = await updateCartItem(session.id, id, parsed.data);
    return ok(cart);
  } catch (e) {
    return handleUnknown(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const { id } = await params;
    const cart = await removeCartItem(session.id, id);
    return ok(cart);
  } catch (e) {
    return handleUnknown(e);
  }
}
