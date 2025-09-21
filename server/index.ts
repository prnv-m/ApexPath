import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleJobs } from "./routes/jobs";
import { handleUploadResume, handleRecommendations, handleUploadAndRecommend } from "./routes/resume";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Jobs API
  app.get("/api/jobs", handleJobs);

  // Resume APIs
  app.post("/api/upload-resume", handleUploadResume);
  app.post("/api/recommendations", handleRecommendations);

  // NEW: RAG + Grok endpoint
  app.post("/api/upload-and-recommend", handleUploadAndRecommend);

  return app;
}
