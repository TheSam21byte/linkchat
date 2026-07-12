import { Router } from "express";
import {
  getMyServers,
  getMembersByServer,
  getServersByUser,
  joinServer,
  kickMember,
  updateMemberRole,
} from "../controllers/member.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireServerRole } from "../middlewares/permissions.middleware.js";

const router = Router();

router.get("/me", requireAuth, getMyServers);
router.post("/join/:serverId", requireAuth, joinServer);

router.get(
  "/server/:serverId",
  requireAuth,
  requireServerRole(["owner", "admin", "member"], (req) => req.params.serverId),
  getMembersByServer
);

router.get("/user/:userId", requireAuth, getServersByUser);
router.patch("/:memberId/role", requireAuth, updateMemberRole);
router.delete("/:memberId", requireAuth, kickMember);

export default router;
