import { Router } from "express";
import { createLog, getLogs, getSummary } from "../controllers/logController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();

router.post("/createlog", createLog);
router.get("/getlogs",authMiddleware,  getLogs);
router.get("/summary",authMiddleware,  getSummary);

export default router;
