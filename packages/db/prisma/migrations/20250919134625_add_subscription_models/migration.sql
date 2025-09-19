-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED', 'GRACE_PERIOD');

-- CreateEnum
CREATE TYPE "public"."SubscriptionPlan" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "public"."Doctor" ADD COLUMN     "razorpay_customer_id" TEXT,
ADD COLUMN     "subscription_end" TIMESTAMP(3),
ADD COLUMN     "subscription_plan" "public"."SubscriptionPlan",
ADD COLUMN     "subscription_start" TIMESTAMP(3),
ADD COLUMN     "subscription_status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE';

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "plan" "public"."SubscriptionPlan" NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "razorpay_subscription_id" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "cancelled_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentTransaction" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "razorpay_payment_id" TEXT NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "public"."PaymentStatus" NOT NULL,
    "payment_method" TEXT,
    "failure_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subscription_doctor_id_idx" ON "public"."Subscription"("doctor_id");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "public"."Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_end_date_idx" ON "public"."Subscription"("end_date");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_razorpay_payment_id_key" ON "public"."PaymentTransaction"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "PaymentTransaction_doctor_id_idx" ON "public"."PaymentTransaction"("doctor_id");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "public"."PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_razorpay_payment_id_idx" ON "public"."PaymentTransaction"("razorpay_payment_id");

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
