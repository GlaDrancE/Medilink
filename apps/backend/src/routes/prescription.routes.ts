import { RequestHandler, Router } from "express";
import { addPrescription, getPrescription, updateMedicine, getFollowUp, getDoctorPrescriptions } from "../controller/prescription.controller";
import { authenticateRequest } from "../middleware/authenticateRequets";

const router: Router = Router();

router.get("/prescription", authenticateRequest as RequestHandler, getPrescription as RequestHandler);
router.get("/prescription/doctor", authenticateRequest as RequestHandler, getDoctorPrescriptions as RequestHandler);
router.post("/prescription", authenticateRequest as RequestHandler, addPrescription as RequestHandler);
router.patch("/medicine/:id", updateMedicine);
router.get("/follow-up/:id", authenticateRequest as RequestHandler, getFollowUp as RequestHandler);

export default router;
