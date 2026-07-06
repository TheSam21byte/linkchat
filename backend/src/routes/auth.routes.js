import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/register", uploadAvatar.single("avatar"), register);
router.post("/login", login);
router.get("/me", requireAuth, me);

export default router;