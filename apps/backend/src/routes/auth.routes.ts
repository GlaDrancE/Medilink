import { RequestHandler, Router } from "express";
import { registerDoctor, loginDoctor, registerPatient, loginPatient } from "../controller/auth.controller";
import { getAllPatients } from "../controller/patient.controller";
const router: Router = Router();

router.post("/doctor/register", registerDoctor);
router.post("/doctor/login", loginDoctor as RequestHandler);
router.post("/patient/register", registerPatient);
router.post("/patient/login", loginPatient as RequestHandler);
router.get("/patient", getAllPatients);

export default router;
