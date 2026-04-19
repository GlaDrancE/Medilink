/*
  Warnings:

  - You are about to drop the column `doctor_id` on the `Patient` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_doctor_id_fkey";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "doctor_id";

-- CreateTable
CREATE TABLE "_DoctorToPatient" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DoctorToPatient_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DoctorToPatient_B_index" ON "_DoctorToPatient"("B");

-- AddForeignKey
ALTER TABLE "_DoctorToPatient" ADD CONSTRAINT "_DoctorToPatient_A_fkey" FOREIGN KEY ("A") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorToPatient" ADD CONSTRAINT "_DoctorToPatient_B_fkey" FOREIGN KEY ("B") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
