import { Router } from "express";
import {
  getMessagesByChannel,
  deleteMessage
} from "../controllers/message.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  requireServerRole,
  getServerIdFromChannelId,
  getServerIdFromMessageId
} from "../middlewares/permissions.middleware.js";

const router = Router();

router.get(
  "/channel/:channelId",
  requireAuth,
  requireServerRole(["owner", "admin", "member"], (req) =>
    getServerIdFromChannelId(req.params.channelId)
  ),
  getMessagesByChannel
);

router.delete(
  "/:id",
  requireAuth,
  requireServerRole(["owner", "admin"], (req) =>
    getServerIdFromMessageId(req.params.id)
  ),
  deleteMessage
);

export default router;