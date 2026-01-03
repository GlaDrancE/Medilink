import { RequestHandler, Router } from "express";
import { addPrescription, getPrescription, updateMedicine } from "../controller/prescription.controller";
import { authMiddleware as patientAuthMiddleware } from "../middleware/patientAuthMiddleware";
import { authMiddleware as doctorAuthMiddleware } from "../middleware/authMiddleware";

const router: Router = Router();

router.get("/prescription", patientAuthMiddleware as RequestHandler, getPrescription as RequestHandler);
router.post("/prescription", doctorAuthMiddleware as RequestHandler, addPrescription as RequestHandler);
router.patch("/medicine/:id", updateMedicine);

export default router; 