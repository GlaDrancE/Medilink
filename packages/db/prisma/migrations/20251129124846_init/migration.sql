-- CreateEnum
CREATE TYPE "FoodTiming" AS ENUM ('BEFORE', 'AFTER');

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "primary_email_address_id" TEXT NOT NULL,
    "medical_registration_number" TEXT,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "consultation_fees" INTEGER,
    "consultation_type" TEXT,
    "qualifications" TEXT,
    "years_of_experience" INTEGER,
    "hospital" TEXT NOT NULL DEFAULT 'Not Specified',
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

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "gender" TEXT,
    "age" INTEGER,
    "weight" INTEGER,
    "date_of_birth" TIMESTAMP(3),
    "blood_group" TEXT,
    "allergies" TEXT[],
    "medical_history" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "document_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescriptions" (
    "id" TEXT NOT NULL,
    "index" INTEGER NOT NULL DEFAULT 0,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "prescription_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prescription_text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" JSONB NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "before_after_food" "FoodTiming" NOT NULL,
    "prescription_id" TEXT NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkup" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "checkup_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkup_text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Checkup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_primary_email_address_id_key" ON "Doctor"("primary_email_address_id");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_username_key" ON "Doctor"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescriptions" ADD CONSTRAINT "Prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescriptions" ADD CONSTRAINT "Prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "Prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkup" ADD CONSTRAINT "Checkup_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "Prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
