import { Router, RequestHandler } from "express";
import { analyzeDocument, analyzeDocumentBatch } from "../controller/ai-analysis.controller";
import { authMiddleware } from "../middleware/patientAuthMiddleware";

const router: Router = Router();

// Analyze single document
router.post("/ai/analyze", authMiddleware as RequestHandler, analyzeDocument as RequestHandler);

// Analyze multiple documents
router.post("/ai/analyze/batch", authMiddleware as RequestHandler, analyzeDocumentBatch as RequestHandler);

export default router;

