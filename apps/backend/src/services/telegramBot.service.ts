import prisma from "@repo/db";
import { generateToken } from "../utils/jwt";
import { analyzePatientQuery } from "./ai-analysis.service";

// ── Session store (per Telegram chatId) ─────────────────────────────────────

interface BotSession {
    phone?: string;
    patientId?: string;
    token?: string;
    awaitingOtp?: boolean;
}

const sessions = new Map<string, BotSession>();

// ── OTP store (independent of the existing storeOtp utility so we can track
//    expiry correctly — the original getOTP has a bug where it checks
//    otp.expiresAt on a number value, never expiring entries) ─────────────────

interface OtpEntry {
    otp: string;
    expiresAt: number;
}

const otpStore = new Map<string, OtpEntry>();

function generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function storeOtp(phone: string, otp: string): void {
    otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
}

function validateOtp(phone: string, otp: string): boolean {
    const entry = otpStore.get(phone);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
        otpStore.delete(phone);
        return false;
    }
    if (entry.otp !== otp) return false;
    otpStore.delete(phone);
    return true;
}

// ── Service ──────────────────────────────────────────────────────────────────

export class TelegramBotService {
    static getSession(chatId: string): BotSession {
        if (!sessions.has(chatId)) sessions.set(chatId, {});
        return sessions.get(chatId)!;
    }

    static clearSession(chatId: string): void {
        sessions.set(chatId, {});
    }

    /**
     * Called when a patient sends their phone number.
     * Returns the OTP string so the bot can echo it back in chat.
     * Throws if the phone is not registered.
     */
    static async handlePhone(chatId: string, phone: string): Promise<string> {
        const patient = await prisma.patient.findFirst({ where: { phone } });
        if (!patient) {
            throw new Error("NOT_FOUND");
        }

        const otp = generateOtp();
        storeOtp(phone, otp);

        const session = this.getSession(chatId);
        session.phone = phone;
        session.awaitingOtp = true;

        return otp;
    }

    /**
     * Called when the patient submits an OTP.
     * On success: links telegram_chat_id, issues JWT, stores token in session.
     * Returns { token, patientName } or null on failure.
     */
    static async handleOtp(
        chatId: string,
        otp: string
    ): Promise<{ token: string; patientName: string } | null> {
        const session = this.getSession(chatId);
        if (!session.phone) return null;

        const valid = validateOtp(session.phone, otp);
        if (!valid) return null;

        const patient = await prisma.patient.findFirst({
            where: { phone: session.phone },
        });
        if (!patient) return null;

        // Link this Telegram chat to the patient record
        await prisma.patient.update({
            where: { id: patient.id },
            data: { telegram_chat_id: chatId },
        });

        const token = generateToken({ id: patient.id }, "patient");

        session.token = token;
        session.patientId = patient.id;
        session.awaitingOtp = false;
        session.phone = undefined;

        return { token, patientName: patient.name ?? "Patient" };
    }

    /**
     * Called on /start when telegram_chat_id already exists in the DB.
     * Skips OTP — issues a fresh token directly.
     * Returns { token, patientName } or null if not linked.
     */
    static async handleReturningUser(
        chatId: string
    ): Promise<{ token: string; patientName: string } | null> {
        const patient = await prisma.patient.findFirst({
            where: { telegram_chat_id: chatId },
        });
        if (!patient) return null;

        const token = generateToken({ id: patient.id }, "patient");

        const session = this.getSession(chatId);
        session.token = token;
        session.patientId = patient.id;
        session.awaitingOtp = false;

        return { token, patientName: patient.name ?? "Patient" };
    }

    /**
     * Routes a free-form text query to the AI analysis service.
     * Requires an active session with a patientId.
     */
    static async handleQuery(chatId: string, query: string): Promise<string> {
        const session = this.getSession(chatId);
        if (!session.patientId) {
            return "Session expired. Please send your phone number again to re-authenticate.";
        }

        try {
            const result = await analyzePatientQuery(query, session.patientId);
            return result.text;
        } catch (error) {
            console.error("[TelegramBot] handleQuery error:", error);
            return "Sorry, I encountered an error processing your request. Please try again.";
        }
    }
}
