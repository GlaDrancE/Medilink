/*
  Warnings:

  - A unique constraint covering the columns `[telegram_chat_id]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "telegram_chat_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_telegram_chat_id_key" ON "Patient"("telegram_chat_id");
