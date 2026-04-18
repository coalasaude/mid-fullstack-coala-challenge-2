-- AlterTable
ALTER TABLE "MedicalExam" ADD COLUMN "uploadedById" TEXT;
ALTER TABLE "MedicalExam" ADD COLUMN "reportedById" TEXT;

-- Assign existing exams to the oldest user when possible
UPDATE "MedicalExam"
SET "uploadedById" = (
  SELECT u."id"
  FROM "User" u
  ORDER BY u."createdAt" ASC
  LIMIT 1
)
WHERE "uploadedById" IS NULL
  AND EXISTS (SELECT 1 FROM "User");

-- Remove legacy rows that cannot satisfy the new association (no user to attach)
DELETE FROM "MedicalExam" WHERE "uploadedById" IS NULL;

-- AlterTable
ALTER TABLE "MedicalExam" ALTER COLUMN "uploadedById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MedicalExam" ADD CONSTRAINT "MedicalExam_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MedicalExam" ADD CONSTRAINT "MedicalExam_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
