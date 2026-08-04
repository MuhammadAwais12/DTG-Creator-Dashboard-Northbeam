import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTopAds } from "../server/northbeam.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const dateRange = (req.query.dateRange as string) || "14d";
    const data = await getTopAds(dateRange);
    res.json(data);
  } catch (error) {
    console.error("Error in /api/top-ads:", error);
    res.status(500).json({ error: "Failed to fetch top ads" });
  }
}
