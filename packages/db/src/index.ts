import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, "../.env") })

// Export types for subscription system
export type {
    Doctor,
    Patient,
    Subscription,
    PaymentTransaction,
} from "./generated/prisma/client";
export {
    SubscriptionStatus,
    SubscriptionPlan,
    PaymentStatus,
} from "./generated/prisma/client";

export * from "./subscription.types";
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL || ''
});
const prisma = new PrismaClient({ adapter });

export default prisma; 