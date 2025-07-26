/*
  Warnings:

  - You are about to drop the `Doctor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "Prescriptions" DROP CONSTRAINT "Prescriptions_doctor_id_fkey";

-- DropTable
DROP TABLE "Doctor";

-- CreateTable
CREATE TABLE "SuperDoctor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "license_number" TEXT,
    "specialization" TEXT,
    "experience" INTEGER,
    "bio" TEXT,
    "profile_picture" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_rejected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuperDoctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuperDoctor_email_key" ON "SuperDoctor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SuperDoctor_phone_key" ON "SuperDoctor"("phone");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "SuperDoctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescriptions" ADD CONSTRAINT "Prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "SuperDoctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
