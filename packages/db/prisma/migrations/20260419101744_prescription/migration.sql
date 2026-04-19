/*
  Warnings:

  - Added the required column `reason_for_visit` to the `Prescriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prescriptions" ADD COLUMN     "reason_for_visit" TEXT NOT NULL;
