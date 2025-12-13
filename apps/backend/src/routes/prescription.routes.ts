import { RequestHandler, Router } from "express";
import { addPrescription, getPrescription, updateMedicine } from "../controller/prescription.controller";
import { authMiddleware as patientAuthMiddleware } from "../middleware/patientAuthMiddleware";
import { authMiddleware as doctorAuthMiddleware } from "../middleware/authMiddleware";
import { accessControlManager } from "../middleware/accessControlManager";
import { trackFeatureUsage } from "../middleware/featureAccessMiddleware";

const router: Router = Router();

// Viewing prescriptions is free for patients
router.get("/prescription", patientAuthMiddleware as RequestHandler, getPrescription as RequestHandler);

// Creating prescriptions requires subscription for doctors
router.post("/prescription", 
  doctorAuthMiddleware as RequestHandler, 
  // accessControlManager.createFeatureMiddleware('CREATE_PRESCRIPTION') as RequestHandler,
  trackFeatureUsage('CREATE_PRESCRIPTION'),
  addPrescription as RequestHandler
);

// Updating medicine (free feature)
router.patch("/medicine/:id", updateMedicine);

export default router; 