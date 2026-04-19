import { RequestHandler, Router } from "express";
import * as DoctorController from "../controller/doctor.controller";
import { authenticateRequest } from "../middleware/authenticateRequets";

const router: Router = Router();

router.get("/doctor", authenticateRequest as RequestHandler, DoctorController.getDoctorById);
router.get("/doctor/all", authenticateRequest as RequestHandler, DoctorController.getAllDoctors);
router.get("/doctor/patients", authenticateRequest as RequestHandler, DoctorController.getAllPatientsForDoctor);
router.get("/doctor/recent", authenticateRequest as RequestHandler, DoctorController.getRecentPatients);
router.put("/doctor/:id", authenticateRequest as RequestHandler, DoctorController.updateDoctor);
router.delete("/doctor", authenticateRequest as RequestHandler, DoctorController.deleteDoctor);


export default router;