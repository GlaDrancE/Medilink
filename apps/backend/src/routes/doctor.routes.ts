import { RequestHandler, Router } from "express";
import * as DoctorController from "../controller/doctor.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { authenticateRequest } from "../middleware/authenticateRequets";

const router: Router = Router();

router.get("/doctor", authenticateRequest as RequestHandler, DoctorController.getDoctorById)
router.get("/doctor/all", authMiddleware as RequestHandler, DoctorController.getAllDoctors)
router.put("/doctor/:id", authMiddleware as RequestHandler, DoctorController.updateDoctor)
router.delete("/doctor", authMiddleware as RequestHandler, DoctorController.deleteDoctor)
router.get("/doctor/recent", authMiddleware as RequestHandler, DoctorController.getRecentPatients)

router.post("/webhook/clerk", DoctorController.doctorWebhook)


export default router;