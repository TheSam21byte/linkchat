import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    app: "LinkChat API",
    status: "running",
    message: "Backend funcionando correctamente",
  });
});

export default router;
