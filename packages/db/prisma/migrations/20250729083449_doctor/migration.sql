/*
  Warnings:

  - A unique constraint covering the columns `[primary_email_address_id]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `primary_email_address_id` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "primary_email_address_id" TEXT NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_primary_email_address_id_key" ON "Doctor"("primary_email_address_id");
