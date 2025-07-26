import { RequestHandler, Router } from "express";
import { getDoctorById, createDoctor, getAllDoctors, updateDoctor, deleteDoctor } from "../controller/doctor.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = Router();

router.get("/doctor", authMiddleware as RequestHandler, getDoctorById)
router.post("/doctor", authMiddleware as RequestHandler, createDoctor)
router.get("/doctor", authMiddleware as RequestHandler, getAllDoctors)
router.put("/doctor", authMiddleware as RequestHandler, updateDoctor)
router.delete("/doctor", authMiddleware as RequestHandler, deleteDoctor)


export default router;