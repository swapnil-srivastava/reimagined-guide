import type { NextApiRequest, NextApiResponse } from "next";
import { availableSlots, loadByToken, MAX_RANGE_DAYS } from "../../../../lib/server/booking";

// Free start times of one host: GET ?host=<id>&from=<iso>&to=<iso>[&exclude=<booking id>]
// `exclude` is the buyer's own booking when they are moving it.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method" });
  }
  res.setHeader("Cache-Control", "no-store");
  const from = new Date(String(req.query.from ?? ""));
  const to = new Date(String(req.query.to ?? ""));
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || to <= from || to.getTime() - from.getTime() > MAX_RANGE_DAYS * 86_400_000) {
    return res.status(400).json({ error: "bad_range" });
  }
  try {
    const ctx = await loadByToken(String(req.query.token ?? ""));
    if (!ctx) return res.status(404).json({ error: "not_found" });
    if (ctx.state === "revoked" || !ctx.type.active) return res.status(410).json({ error: "invalid_link" });
    const host = ctx.hosts.find((h) => h.id === req.query.host) ?? ctx.hosts.find((h) => h.id === ctx.defaultHostId);
    if (!host) return res.status(200).json({ slots: [] });
    const exclude = typeof req.query.exclude === "string" ? req.query.exclude : undefined;
    if (exclude && !ctx.bookings.some((b) => b.id === exclude && b.status === "confirmed")) {
      return res.status(400).json({ error: "bad_booking" });
    }
    const slots = await availableSlots(ctx.type, host, from, to, exclude);
    return res.status(200).json({ host_id: host.id, slots });
  } catch (error) {
    console.error("booking slots failed", error);
    return res.status(500).json({ error: "server" });
  }
}
