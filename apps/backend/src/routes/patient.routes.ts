import { RequestHandler, Router } from "express";
import { createPatient, getPatientById, updatePatient, deletePatient, searchPatientByPhone, uploadDocument } from "../controller/patient.controller";
import { authMiddleware } from "../middleware/patientAuthMiddleware";
import { authMiddleware as doctorAuthMiddleware } from "../middleware/authMiddleware";
import { accessControlManager } from "../middleware/accessControlManager";
import { trackFeatureUsage, rateLimitPremiumFeature } from "../middleware/featureAccessMiddleware";

export const router: Router = Router();

// Document upload (free feature for patients)
router.put("/patient/document", authMiddleware as RequestHandler, uploadDocument);

// New patient creation requires subscription (doctor creates patients)
router.post("/patient", 
  doctorAuthMiddleware as RequestHandler, 
  // accessControlManager.createFeatureMiddleware('NEW_PATIENT'),
  // rateLimitPremiumFeature('NEW_PATIENT', 50, 24 * 60 * 60 * 1000), // 50 per day
  trackFeatureUsage('NEW_PATIENT'),
  createPatient
);

// Patient search (free feature)
router.get("/patient/search", searchPatientByPhone as RequestHandler);

// Patient management (free features for existing patients)
router.get("/patient", authMiddleware as RequestHandler, getPatientById);
router.put("/patient/:id", authMiddleware as RequestHandler, updatePatient);
router.delete("/patient/:id", authMiddleware as RequestHandler, deletePatient);

export default router; 