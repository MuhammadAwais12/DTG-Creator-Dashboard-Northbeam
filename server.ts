import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getCreatorsList, getMetrics, getTopAds } from "./server/northbeam.js";
import { normalizeCreatorCode } from "./src/utils/creator.js";

const PORT = 3000;

function maskSecret(val?: string): string {
  if (!val) return "(not set)";
  if (val.length <= 8) return `${val.slice(0, 2)}...${val.slice(-2)}`;
  return `${val.slice(0, 4)}...${val.slice(-4)}`;
}

async function testNorthbeamCredentials() {
  const apiKey = process.env.NORTHBEAM_API_KEY;
  const clientId = process.env.NORTHBEAM_CLIENT_ID;

  const targetUrl = "https://api.northbeam.io/v1/exports/attribution-models";

  console.log("==================================================");
  console.log("[NORTHBEAM CREDENTIALS CHECK]");
  console.log(`process.env.NORTHBEAM_API_KEY  : ${maskSecret(apiKey)}`);
  console.log(`process.env.NORTHBEAM_CLIENT_ID: ${maskSecret(clientId)}`);
  console.log(`[EXACT REQUEST URL STRING]      : "${targetUrl}" (length: ${targetUrl.length})`);

  if (!apiKey || !clientId) {
    console.warn("[NORTHBEAM TEST CALL] Skipped: NORTHBEAM_API_KEY or NORTHBEAM_CLIENT_ID is missing in process.env.");
    console.log("==================================================");
    return { status: null, body: "Missing env vars" };
  }

  const headers = {
    "Authorization": apiKey,
    "Data-Client-ID": clientId,
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };

  const maskedHeaders = {
    "Authorization": maskSecret(apiKey),
    "Data-Client-ID": maskSecret(clientId),
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  };

  console.log("[NORTHBEAM REQUEST HEADERS]   :", JSON.stringify(maskedHeaders, null, 2));

  try {
    console.log(`[NORTHBEAM TEST CALL] Sending GET request to "${targetUrl}" ...`);
    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });

    const rawText = await response.text();
    console.log(`[NORTHBEAM TEST CALL] HTTP Status: ${response.status} ${response.statusText}`);
    console.log(`[NORTHBEAM TEST CALL] Raw Response:\n${rawText}`);
    console.log("==================================================");
    return {
      exactUrl: targetUrl,
      headersSentMasked: maskedHeaders,
      status: response.status,
      statusText: response.statusText,
      body: rawText,
    };
  } catch (err: any) {
    console.error("[NORTHBEAM TEST CALL] Fetch Error:", err);
    console.log("==================================================");
    return {
      exactUrl: targetUrl,
      headersSentMasked: maskedHeaders,
      status: 500,
      error: err?.message,
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Test route to manually trigger credential verification & attribution-models fetch
  app.get("/api/northbeam/test-credentials", async (req, res) => {
    const result = await testNorthbeamCredentials();
    res.json({
      apiKeyMasked: maskSecret(process.env.NORTHBEAM_API_KEY),
      clientIdMasked: maskSecret(process.env.NORTHBEAM_CLIENT_ID),
      testCallResult: result,
    });
  });

  // 1. Route to get creator codes / breakdowns validation
  app.get(["/api/northbeam/creators", "/api/creators", "/api/creators/validate", "/api/breakdowns"], async (req, res) => {
    try {
      const { creators, adNames } = await getCreatorsList();
      const codeInput = (req.query.code || req.query.creatorCode) as string;

      if (codeInput) {
        const normalizedInput = normalizeCreatorCode(codeInput);
        const isValid = creators.includes(normalizedInput);
        console.log(
          `[Validation Express] Entered Code: "${codeInput}" -> Normalized: "${normalizedInput}" | Found in ${creators.length} active codes: ${isValid}`
        );
        return res.json({ isValid, normalizedCode: normalizedInput, creators, adNames });
      }

      res.json({ creators, adNames });
    } catch (error) {
      console.error("Error in /api/northbeam/creators:", error);
      res.status(500).json({ error: "Failed to fetch creator codes" });
    }
  });

  // 2. Route to fetch creator metrics filtered by date range and code
  app.get(["/api/northbeam/metrics", "/api/metrics"], async (req, res) => {
    try {
      const dateRange = (req.query.dateRange as string) || "7d";
      const creatorCode = (req.query.creatorCode as string) || "";
      const data = await getMetrics(creatorCode, dateRange);
      res.json(data);
    } catch (error) {
      console.error("Error in /api/northbeam/metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // 3. Route for Top 10 High Conversion Ads
  app.get(["/api/northbeam/top-ads", "/api/top-ads"], async (req, res) => {
    try {
      const dateRange = (req.query.dateRange as string) || "14d";
      const data = await getTopAds(dateRange);
      res.json(data);
    } catch (error) {
      console.error("Error in /api/northbeam/top-ads:", error);
      res.status(500).json({ error: "Failed to fetch top ads" });
    }
  });

  // Serve static files in production / Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Down to Ground Creator Dashboard Server listening on http://0.0.0.0:${PORT}`);
    await testNorthbeamCredentials();
  });
}

startServer();
