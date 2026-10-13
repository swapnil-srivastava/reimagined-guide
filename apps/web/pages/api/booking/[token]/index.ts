import type { NextApiRequest, NextApiResponse } from "next";
import { loadByToken, publicContext } from "../../../../lib/server/booking";

// The booking link's details: the call, its hosts and the buyer's bookings
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method" });
  }
  res.setHeader("Cache-Control", "no-store");
  try {
    const ctx = await loadByToken(String(req.query.token ?? ""));
    if (!ctx) return res.status(404).json({ error: "not_found" });
    return res.status(200).json(publicContext(ctx));
  } catch (error) {
    console.error("booking info failed", error);
    return res.status(500).json({ error: "server" });
  }
}
