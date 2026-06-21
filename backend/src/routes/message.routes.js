import { Router } from "express";
import { getMessagesByChannel } from "../controllers/message.controller.js";

const router = Router();

router.get("/channel/:channelId", getMessagesByChannel);

export default router;