import { Router } from "express";
import { createLog, getLogs } from "../controllers/logController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();

router.post("/createlog", createLog);
router.get("/getlogs", authMiddleware, getLogs);

export default router;
