/*
  Warnings:

  - You are about to drop the column `doctor_id` on the `Checkup` table. All the data in the column will be lost.
  - You are about to drop the column `patient_id` on the `Checkup` table. All the data in the column will be lost.
  - Added the required column `prescription_id` to the `Checkup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Checkup" DROP CONSTRAINT "Checkup_patient_id_fkey";

-- AlterTable
ALTER TABLE "public"."Checkup" DROP COLUMN "doctor_id",
DROP COLUMN "patient_id",
ADD COLUMN     "prescription_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Checkup" ADD CONSTRAINT "Checkup_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "public"."Prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
