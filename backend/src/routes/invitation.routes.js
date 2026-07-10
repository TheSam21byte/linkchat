import { Router } from "express";
import {
  createInvitation,
  getInvitations,
  getInvitationByCode,
  joinByInvitation,
  disableInvitation
} from "../controllers/invitation.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  requireServerRole,
  getServerIdFromInvitationCode
} from "../middlewares/permissions.middleware.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireServerRole(["owner", "admin"], (req) => req.body.serverId),
  createInvitation
);

router.get("/", requireAuth, getInvitations);

router.get("/:code", getInvitationByCode);

router.post("/join/:code", requireAuth, joinByInvitation);

router.patch(
  "/:code/disable",
  requireAuth,
  requireServerRole(["owner", "admin"], (req) =>
    getServerIdFromInvitationCode(req.params.code)
  ),
  disableInvitation
);

export default router;