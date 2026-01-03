import express from 'express'
import cors from 'cors'
import doctorRouter from './routes/doctor.routes'
import patientRouter from './routes/patient.routes'
import prescriptionRouter from './routes/prescription.routes'
import otpRouter from './routes/otp.routes'
import authRouter from './routes/auth.routes'
import { config } from '@repo/common'

const app = express()

app.use(express.json())

const PORT = config.port

app.use(cors())
app.use("/api/v1", doctorRouter)
app.use("/api/v1", patientRouter)
app.use("/api/v1", prescriptionRouter)
app.use("/api/v1", otpRouter)
app.use("/api/v1/auth", authRouter)
app.get("/", (req, res) => {
    res.send("Hello World")
})

app.listen(3000, () => {
    console.log(`Server is running on port ${PORT}`)
})
