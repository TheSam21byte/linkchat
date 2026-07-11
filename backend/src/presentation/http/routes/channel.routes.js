import { Router } from "express";
import {
  createChannel,
  getChannelsByServer,
  getChannelById,
  updateChannel,
  deleteChannel
} from "../controllers/channel.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  requireServerRole,
  getServerIdFromChannelId
} from "../middlewares/permissions.middleware.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireServerRole(["owner", "admin"], (req) => req.body.serverId),
  createChannel
);

router.get(
  "/server/:serverId",
  requireAuth,
  requireServerRole(["owner", "admin", "member"], (req) => req.params.serverId),
  getChannelsByServer
);

router.get(
  "/:id",
  requireAuth,
  requireServerRole(["owner", "admin", "member"], (req) =>
    getServerIdFromChannelId(req.params.id)
  ),
  getChannelById
);

router.patch(
  "/:id",
  requireAuth,
  requireServerRole(["owner", "admin"], (req) =>
    getServerIdFromChannelId(req.params.id)
  ),
  updateChannel
);

router.delete(
  "/:id",
  requireAuth,
  requireServerRole(["owner", "admin"], (req) =>
    getServerIdFromChannelId(req.params.id)
  ),
  deleteChannel
);

export default router;