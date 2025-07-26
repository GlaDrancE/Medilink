/*
  Warnings:

  - You are about to drop the column `phone` on the `Doctor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Doctor_phone_key";

-- DropIndex
DROP INDEX "SuperDoctor_phone_key";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "Prescriptions" ALTER COLUMN "index" SET DEFAULT 0;
