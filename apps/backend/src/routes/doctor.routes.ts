import { RequestHandler, Router } from "express";
import { getDoctorById, getAllDoctors, updateDoctor, deleteDoctor, doctorWebhook } from "../controller/doctor.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = Router();

router.get("/doctor", authMiddleware as RequestHandler, getDoctorById)
router.get("/doctor/all", authMiddleware as RequestHandler, getAllDoctors)
router.put("/doctor/:id", authMiddleware as RequestHandler, updateDoctor)
router.delete("/doctor", authMiddleware as RequestHandler, deleteDoctor)

router.post("/webhook/clerk", doctorWebhook)


export default router;