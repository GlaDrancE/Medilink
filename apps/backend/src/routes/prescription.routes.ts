import { RequestHandler, Router } from "express";
import { addPrescription, getPrescription, updateMedicine } from "../controller/prescription.controller";
import { authMiddleware as patientAuthMiddleware } from "../middleware/patientAuthMiddleware";
import { authenticateRequest } from "../middleware/authenticateRequets";

const router: Router = Router();

router.get("/prescription", authenticateRequest as RequestHandler, getPrescription as RequestHandler);
router.post("/prescription", authenticateRequest as RequestHandler, addPrescription as RequestHandler);
router.patch("/medicine/:id", updateMedicine);

export default router; 