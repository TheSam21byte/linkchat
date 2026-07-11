import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = Router();

function handleAvatarUpload(req, res, next) {
  uploadAvatar.single("avatar")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || "No se pudo procesar la imagen.",
      });
    }

    next();
  });
}

router.post("/register", handleAvatarUpload, register);
router.post("/login", login);
router.get("/me", requireAuth, me);

export default router;
