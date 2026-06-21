import { Router } from "express";
import { startUser, getUsers } from "../controllers/user.controller.js";

const router = Router();

router.post("/start", startUser);
router.get("/", getUsers);

export default router;