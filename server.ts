import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Standard production security & performance middleware
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for simplicity with external assets like Three.js/Firebase
    })
  );
  app.use(express.json());

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "operational", 
      version: "0.1.0",
      timestamp: new Date().toISOString() 
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Running in DEVELOPMENT mode with Vite HMR");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Running in PRODUCTION mode");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files with caching
    app.use(express.static(distPath, {
      maxAge: '1d',
      index: false
    }));

    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
    ┌───────────────────────────────────────────────────┐
    │                                                   │
    │   GENESIS LAB SERVER ACTIVE                       │
    │   URL: http://localhost:${PORT.toString().padEnd(27)} │
    │   MODE: ${(process.env.NODE_ENV || 'development').padEnd(30)} │
    │                                                   │
    └───────────────────────────────────────────────────┘
    `);
  });
}

startServer().catch((err) => {
  console.error("CRITICAL: Failed to start server:", err);
  process.exit(1);
});
