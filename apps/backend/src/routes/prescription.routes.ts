import { RequestHandler, Router } from "express";
import { addPrescription, updateMedicine } from "../controller/prescription.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = Router();

router.post("/prescription", authMiddleware as RequestHandler, addPrescription as RequestHandler);
router.patch("/medicine/:id", updateMedicine);

export default router; 