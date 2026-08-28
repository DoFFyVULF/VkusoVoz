import { ok, handleUnknown } from "@/lib/server/api-response";
import { collectionsMock } from "@/lib/mock-data";

export async function GET() {
  try {
    return ok(collectionsMock);
  } catch (e) {
    return handleUnknown(e);
  }
}
