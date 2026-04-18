-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ATTENDANT', 'DOCTOR');

-- CreateEnum
CREATE TYPE "MedicalExamStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'ERROR', 'REPORTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAccessAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalExam" (
    "id" TEXT NOT NULL,
    "status" "MedicalExamStatus" NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storagePath" TEXT,
    "processingResult" TEXT,
    "report" TEXT,
    "uploadedById" TEXT NOT NULL,
    "reportedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccessLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "useCase" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FailedMessage" (
    "id" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "headers" JSONB,
    "errorMessage" TEXT NOT NULL,
    "errorStack" TEXT,
    "attempts" INTEGER NOT NULL,
    "firstFailedAt" TIMESTAMP(3) NOT NULL,
    "lastFailedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserAccessLog_userId_createdAt_idx" ON "UserAccessLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserAccessLog_module_useCase_idx" ON "UserAccessLog"("module", "useCase");

-- CreateIndex
CREATE INDEX "FailedMessage_queue_createdAt_idx" ON "FailedMessage"("queue", "createdAt");

-- AddForeignKey
ALTER TABLE "MedicalExam" ADD CONSTRAINT "MedicalExam_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalExam" ADD CONSTRAINT "MedicalExam_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccessLog" ADD CONSTRAINT "UserAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
