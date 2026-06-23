import { Router } from "express";
import {
  addMemberToServer,
  getMembersByServer,
  getServersByUser
} from "../controllers/member.controller.js";

const router = Router();

router.post("/", addMemberToServer);
router.get("/server/:serverId", getMembersByServer);
router.get("/user/:userId", getServersByUser);

export default router;
