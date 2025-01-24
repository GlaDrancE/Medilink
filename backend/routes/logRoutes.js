import { Router } from "express";
import { createLog, getLogs, getSummary, getUser } from "../controllers/logController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();

router.post("/createlog", createLog);
router.get("/getlogs",authMiddleware,  getLogs);
router.get("/summary",authMiddleware,  getSummary);
router.get("/user/:email", getUser);

export default router;
