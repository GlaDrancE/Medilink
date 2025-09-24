/*
  Warnings:

  - You are about to drop the column `address` on the `Doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Doctor" DROP COLUMN "address",
ADD COLUMN     "consultation_fees" INTEGER,
ADD COLUMN     "consultation_type" TEXT,
ADD COLUMN     "medical_registration_number" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "qualifications" TEXT,
ADD COLUMN     "years_of_experience" INTEGER;
