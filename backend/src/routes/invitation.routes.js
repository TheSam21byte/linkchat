import { Router } from "express";
import {
  createInvitation,
  getInvitations,
  getInvitationByCode,
  joinByInvitation,
  disableInvitation
} from "../controllers/invitation.controller.js";

const router = Router();

router.post("/", createInvitation);
router.get("/", getInvitations);
router.get("/:code", getInvitationByCode);
router.post("/join/:code", joinByInvitation);
router.patch("/:code/disable", disableInvitation);

export default router;