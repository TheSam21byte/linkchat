import { Router } from "express";
import {
  getDirectMessages,
  sendDirectMessage
} from "../controllers/direct-message.controller.js";

const router = Router();

router.get("/:userId/:contactId", getDirectMessages);
router.post("/", sendDirectMessage);

export default router;
