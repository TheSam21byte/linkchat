import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    app: "LinkChat API",
    status: "running",
    message: "Backend funcionando correctamente",
  });
});

router.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? "connected" : "disconnected";

  if (dbState !== 1) {
    return res.status(503).json({
      status: "error",
      db: dbStatus,
    });
  }

  return res.status(200).json({
    status: "ok",
    db: dbStatus,
  });
});

export default router;
