import { Router } from "express";
import { startUser, getUsers, updateMe } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = Router();

router.patch("/me", requireAuth, uploadAvatar.single("avatar"), updateMe);
router.post("/start", startUser);
router.get("/", getUsers);

export default router;
