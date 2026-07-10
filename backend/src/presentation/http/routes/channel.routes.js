import { Router } from "express";
import {
  createChannel,
  getChannelsByServer,
  getChannelById
} from "../controllers/channel.controller.js";

const router = Router();

router.post("/", createChannel);
router.get("/server/:serverId", getChannelsByServer);
router.get("/:id", getChannelById);

export default router;