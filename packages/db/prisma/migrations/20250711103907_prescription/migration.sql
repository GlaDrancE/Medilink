/*
  Warnings:

  - Changed the type of `dosage` on the `Medicine` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "dosage",
ADD COLUMN     "dosage" JSONB NOT NULL;
