import { Router, RequestHandler } from "express";
import { analyzeDocument, analyzeDocumentBatch, analyzePatientQueryHandler } from "../controller/ai-analysis.controller";
import { authMiddleware } from "../middleware/patientAuthMiddleware";

const router: Router = Router();

// Analyze single document
router.post("/ai/analyze", authMiddleware as RequestHandler, analyzeDocument as RequestHandler);

// Analyze multiple documents
router.post("/ai/analyze/batch", authMiddleware as RequestHandler, analyzeDocumentBatch as RequestHandler);

// Answer a free-form patient health query with full medical context
router.post("/ai/patient-query", authMiddleware as RequestHandler, analyzePatientQueryHandler as RequestHandler);

export default router;

