import { ok, handleUnknown } from "@/lib/server/api-response";
import { destroySession } from "@/lib/server/auth";

export async function POST() {
  try {
    await destroySession();
    return ok({ ok: true });
  } catch (e) {
    return handleUnknown(e);
  }
}
