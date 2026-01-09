-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "ai_analyzed_at" TIMESTAMP(3),
ADD COLUMN     "ai_confidence" DOUBLE PRECISION,
ADD COLUMN     "ai_detected_conditions" TEXT[],
ADD COLUMN     "ai_key_findings" TEXT[],
ADD COLUMN     "ai_lab_values" JSONB,
ADD COLUMN     "ai_medications" TEXT[],
ADD COLUMN     "ai_recommendations" TEXT[],
ADD COLUMN     "ai_summary" TEXT;
