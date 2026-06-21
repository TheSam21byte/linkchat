import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Ruta de canales funcionando"
  });
});

export default router;