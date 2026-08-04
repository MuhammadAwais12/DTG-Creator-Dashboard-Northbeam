import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMetrics } from "../server/northbeam.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const dateRange = (req.query.dateRange as string) || "7d";
    const creatorCode = (req.query.creatorCode as string) || "";
    const data = await getMetrics(creatorCode, dateRange);
    res.json(data);
  } catch (error) {
    console.error("Error in /api/metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
}
