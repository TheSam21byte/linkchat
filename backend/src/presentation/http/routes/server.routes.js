import { Router } from "express";
import {
  createServer,
  deleteServer,
  getServerById,
  getServers,
  updateServer,
} from "../controllers/server.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireServerRole } from "../middlewares/permissions.middleware.js";

const router = Router();

router.post("/", requireAuth, createServer);
router.get("/", getServers);
router.get("/:id", getServerById);

router.patch(
  "/:id",
  requireAuth,
  requireServerRole(["owner"], (req) => req.params.id),
  updateServer
);

router.delete(
  "/:id",
  requireAuth,
  requireServerRole(["owner"], (req) => req.params.id),
  deleteServer
);

export default router;
