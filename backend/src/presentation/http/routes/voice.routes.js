import { Router } from "express";
import { joinChimeMeeting } from "../controllers/voice.controller.js";

const router = Router();

router.post("/chime/join", joinChimeMeeting);

export default router;
