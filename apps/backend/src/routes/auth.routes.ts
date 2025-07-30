import { RequestHandler, Router } from "express";
import { registerPatient, loginPatient } from "../controller/auth.controller";
import { getAllPatients } from "../controller/patient.controller";
const router: Router = Router();

router.post("/patient/register", registerPatient);
router.post("/patient/login", loginPatient as RequestHandler);
router.get("/patient", getAllPatients);

export default router;
