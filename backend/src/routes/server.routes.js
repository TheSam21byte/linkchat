import { Router } from "express";
import {
  createServer,
  getServers,
  getServerById
} from "../controllers/server.controller.js";

const router = Router();

router.post("/", createServer);
router.get("/", getServers);
router.get("/:id", getServerById);

export default router;