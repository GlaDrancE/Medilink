/*
  Warnings:

  - Changed the type of `time` on the `Medicine` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `age` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Doctor" RENAME CONSTRAINT "SuperDoctor_pkey" TO "Doctor_pkey";

-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "time",
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "age" TEXT NOT NULL;
