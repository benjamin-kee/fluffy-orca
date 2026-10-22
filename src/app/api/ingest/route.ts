import { runIngestion } from "@/lib/ingest";
import { sources } from "@/lib/sources";

export const dynamic = "force-dynamic";

// Triggered by the scheduler and manually during development.
// Requires: Authorization: Bearer <CRON_SECRET>
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runIngestion(sources);
  const allFailed = results.length > 0 && results.every((r) => !r.ok);
  return Response.json({ results }, { status: allFailed ? 500 : 200 });
}
