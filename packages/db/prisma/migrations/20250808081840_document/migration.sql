-- AlterTable
ALTER TABLE "public"."Patient" ADD COLUMN     "document_id" TEXT;

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
