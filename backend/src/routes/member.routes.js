import { Router } from "express";
import {
  getMembersByServer,
  getServersByUser
} from "../controllers/member.controller.js";

const router = Router();

router.get("/server/:serverId", getMembersByServer);
router.get("/user/:userId", getServersByUser);

export default router;