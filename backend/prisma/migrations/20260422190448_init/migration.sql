-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ATTENDANT', 'DOCTOR');

-- CreateEnum
CREATE TYPE "MedicalExamStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'ERROR', 'REPORTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalExam" (
    "id" TEXT NOT NULL,
    "fileReference" TEXT NOT NULL,
    "status" "MedicalExamStatus" NOT NULL DEFAULT 'PENDING',
    "processingResult" TEXT,
    "report" TEXT,
    "attendantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalExam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MedicalExam_attendantId_idx" ON "MedicalExam"("attendantId");

-- CreateIndex
CREATE INDEX "MedicalExam_status_idx" ON "MedicalExam"("status");

-- AddForeignKey
ALTER TABLE "MedicalExam" ADD CONSTRAINT "MedicalExam_attendantId_fkey" FOREIGN KEY ("attendantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
