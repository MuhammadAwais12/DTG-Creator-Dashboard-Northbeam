import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCreatorsList } from "../server/northbeam.js";
import { normalizeCreatorCode } from "../src/utils/creator.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { creators, adNames } = await getCreatorsList();
    const validateCode = (req.query.code || req.query.creatorCode) as string;

    if (validateCode) {
      const normalizedInput = normalizeCreatorCode(validateCode);
      const isValid = creators.includes(normalizedInput);
      console.log(
        `[Validation Vercel] Input code: "${validateCode}" -> Normalized: "${normalizedInput}" | Found in ${creators.length} active codes: ${isValid}`
      );
      return res.json({ isValid, normalizedCode: normalizedInput, creators, adNames });
    }

    res.json({ creators, adNames });
  } catch (error) {
    console.error("Error in /api/creators:", error);
    res.status(500).json({ error: "Failed to fetch creator codes" });
  }
}
