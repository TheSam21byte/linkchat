import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Ruta de invitaciones funcionando"
  });
});

export default router;