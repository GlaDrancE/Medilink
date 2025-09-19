import { PrismaClient } from "../generated/prisma";

// Export Prisma client
const prisma = new PrismaClient();

// Export types for subscription system
export type {
  Doctor,
  Patient,
  Subscription,
  PaymentTransaction,
  SubscriptionStatus,
  SubscriptionPlan,
  PaymentStatus,
} from "../generated/prisma";

// Export subscription configuration
export * from "./subscription-config";

export default prisma;
