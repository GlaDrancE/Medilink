-- CreateTable
CREATE TABLE "public"."Checkup" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "checkup_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkup_text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Checkup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Checkup" ADD CONSTRAINT "Checkup_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
