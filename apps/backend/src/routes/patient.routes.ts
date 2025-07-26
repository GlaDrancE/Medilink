import { RequestHandler, Router } from "express";
import { createPatient, getPatientById, updatePatient, deletePatient, searchPatientByPhone } from "../controller/patient.controller";
import { authMiddleware } from "../middleware/authMiddleware";

export const router: Router = Router();

router.post("/patient", createPatient);
router.get("/patient/search", searchPatientByPhone as RequestHandler);
router.get("/patient", authMiddleware as RequestHandler, getPatientById);
router.put("/patient/:id", authMiddleware as RequestHandler, updatePatient);
router.delete("/patient/:id", authMiddleware as RequestHandler, deletePatient);

export default router; 