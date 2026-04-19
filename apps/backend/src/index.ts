import express from 'express'
import cors from 'cors'
import { clerkMiddleware } from '@clerk/express'
import doctorRouter from './routes/doctor.routes'
import patientRouter from './routes/patient.routes'
import prescriptionRouter from './routes/prescription.routes'
import otpRouter from './routes/otp.routes'
import authRouter from './routes/auth.routes'
import aiAnalysisRouter from './routes/ai-analysis.routes'
import voiceRouter from './routes/voice.routes'
import paymentRouter from './routes/payment.routes'
import subscriptionRouter from './routes/subscription.routes'
import { bot } from './bot'
import { config } from '@repo/common'

const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

const PORT = config.port

const allowedOrigins = [
    'http://localhost:3001',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    },
    credentials: true,
}));

// Clerk middleware — verifies Bearer tokens and session cookies, attaches auth to req.auth
// Pass keys explicitly since the frontend env uses NEXT_PUBLIC_ prefix
app.use(clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
}));

app.use("/api/v1", doctorRouter)
app.use("/api/v1", patientRouter)
app.use("/api/v1", prescriptionRouter)
app.use("/api/v1", otpRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1", aiAnalysisRouter)
app.use("/api/v1/voice", voiceRouter)
app.use("/api/v1", paymentRouter)
app.use("/api/v1", subscriptionRouter)

app.get("/", (_req, res) => {
    res.send("Hello World")
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

// Start Telegram bot using long polling (no webhook setup required)
if (bot) {
    bot.start({
        onStart: (info) => console.log(`Telegram bot @${info.username} started`),
    }).catch((err) => console.error("[TelegramBot] Failed to start:", err));
}
