import { Router } from "express";
import {
  createMessageInChannel,
  getMessagesByChannel
} from "../controllers/message.controller.js";

const router = Router();

router.get("/channel/:channelId", getMessagesByChannel);
router.post("/channel/:channelId", createMessageInChannel);

export default router;
