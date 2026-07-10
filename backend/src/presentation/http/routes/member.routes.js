import { Router } from "express";
import {
  getMyServers,
  getMembersByServer,
  getServersByUser,
  joinServer
} from "../controllers/member.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", requireAuth, getMyServers);
router.post("/join/:serverId", requireAuth, joinServer);
router.get("/server/:serverId", getMembersByServer);
router.get("/user/:userId", getServersByUser);

export default router;
