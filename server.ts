import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import app, { testNorthbeamCredentials } from "./server/app.js";

const PORT = 3000;

async function startServer() {
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

