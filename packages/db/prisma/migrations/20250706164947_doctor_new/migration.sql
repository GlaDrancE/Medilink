/*
  Warnings:

  - You are about to drop the `SuperDoctor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "Prescriptions" DROP CONSTRAINT "Prescriptions_doctor_id_fkey";

-- DropTable
ALTER TABLE "SuperDoctor" RENAME TO "Doctor";

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_phone_key" ON "Doctor"("phone");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescriptions" ADD CONSTRAINT "Prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
