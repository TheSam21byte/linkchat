import { Router } from "express";
import { getUsers, startUser, updateMe } from "../controllers/user.controller.js";
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

router.patch("/me", requireAuth, handleAvatarUpload, updateMe);
router.post("/start", startUser);
router.get("/", getUsers);

export default router;
