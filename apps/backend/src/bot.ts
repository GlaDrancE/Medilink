import { Bot, GrammyError, HttpError } from "grammy";
import { TelegramBotService } from "./services/telegramBot.service";

// ── Helpers ───────────────────────────────────────────────────────────────────

const PHONE_RE = /^[+]?[\d\s\-()]{7,15}$/;

function looksLikePhone(text: string): boolean {
    return PHONE_RE.test(text.trim());
}

function looksLikeOtp(text: string): boolean {
    return /^\d{6}$/.test(text.trim());
}

// ── Bot instance ──────────────────────────────────────────────────────────────

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.warn("[TelegramBot] TELEGRAM_BOT_TOKEN not set — bot will not start.");
}

export const bot = token ? new Bot(token) : null;

// ── Handlers ──────────────────────────────────────────────────────────────────

if (bot) {
    // /start — check if already linked, otherwise ask for phone
    bot.command("start", async (ctx) => {
        const chatId = String(ctx.chat.id);

        const returning = await TelegramBotService.handleReturningUser(chatId);
        if (returning) {
            await ctx.reply(
                `Welcome back, ${returning.patientName}!\n\nYou're now authenticated. Ask me anything about your health records.\n\n` +
                `Try: "What medicines am I taking?" or "Summarise my medical history."`
            );
            return;
        }

        TelegramBotService.clearSession(chatId);
        await ctx.reply(
            "Welcome to Medilink AI Health Assistant!\n\n" +
            "Please send your registered phone number to get started.\n" +
            "Example: +91XXXXXXXXXX"
        );
    });

    // /logout — clear session
    bot.command("logout", async (ctx) => {
        const chatId = String(ctx.chat.id);
        TelegramBotService.clearSession(chatId);
        await ctx.reply("You have been logged out. Send /start to authenticate again.");
    });

    // /help
    bot.command("help", async (ctx) => {
        await ctx.reply(
            "Medilink AI Assistant commands:\n\n" +
            "/start — authenticate with your phone number\n" +
            "/logout — clear your session\n" +
            "/help — show this message\n\n" +
            "Once authenticated, just type your health question and I'll answer it using your medical records."
        );
    });

    // Main message handler
    bot.on("message:text", async (ctx) => {
        const text = ctx.message.text.trim();
        const chatId = String(ctx.chat.id);
        const session = TelegramBotService.getSession(chatId);

        // ── Step 1: phone number submitted ───────────────────────────────────
        if (looksLikePhone(text) && !session.awaitingOtp) {
            try {
                const otp = await TelegramBotService.handlePhone(chatId, text);
                await ctx.reply(
                    `Your one-time verification code is:\n\n*${otp}*\n\nIt expires in 10 minutes. Reply with this code to verify.`,
                    { parse_mode: "Markdown" }
                );
            } catch (err: any) {
                if (err.message === "NOT_FOUND") {
                    await ctx.reply(
                        "No Medilink account found with that phone number.\n" +
                        "Please check the number or contact your doctor to register."
                    );
                } else {
                    await ctx.reply("Something went wrong. Please try again.");
                }
            }
            return;
        }

        // ── Step 2: OTP submitted ─────────────────────────────────────────────
        if (session.awaitingOtp && looksLikeOtp(text)) {
            const result = await TelegramBotService.handleOtp(chatId, text);
            if (result) {
                await ctx.reply(
                    `Verified! Welcome, ${result.patientName}.\n\n` +
                    `You can now ask me about your prescriptions, lab results, medications, and more.\n\n` +
                    `Try: "What are my recent prescriptions?"`
                );
            } else {
                await ctx.reply(
                    "Invalid or expired OTP. Please send your phone number again to receive a new code."
                );
            }
            return;
        }

        // ── Step 3: authenticated query ───────────────────────────────────────
        if (session.token && session.patientId) {
            await ctx.replyWithChatAction("typing");
            const answer = await TelegramBotService.handleQuery(chatId, text);
            await ctx.reply(answer);
            return;
        }

        // ── Fallback: not authenticated ───────────────────────────────────────
        await ctx.reply(
            "Please send /start and verify with your phone number before asking health questions."
        );
    });

    // Global error handler
    bot.catch((err) => {
        const ctx = err.ctx;
        console.error(`[TelegramBot] Error for update ${ctx.update.update_id}:`);
        if (err.error instanceof GrammyError) {
            console.error("[TelegramBot] Error in request:", err.error.description);
        } else if (err.error instanceof HttpError) {
            console.error("[TelegramBot] Could not contact Telegram:", err.error);
        } else {
            console.error("[TelegramBot] Unknown error:", err.error);
        }
    });
}
