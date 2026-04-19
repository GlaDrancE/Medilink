-- DropForeignKey
ALTER TABLE "Checkup" DROP CONSTRAINT "Checkup_prescription_id_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_prescription_id_fkey";

-- DropForeignKey
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "Prescriptions" DROP CONSTRAINT "Prescriptions_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "Prescriptions" DROP CONSTRAINT "Prescriptions_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_doctor_id_fkey";

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescriptions" ADD CONSTRAINT "Prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescriptions" ADD CONSTRAINT "Prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "Prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkup" ADD CONSTRAINT "Checkup_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "Prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
