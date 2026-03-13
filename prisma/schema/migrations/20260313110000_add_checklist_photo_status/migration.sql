-- CreateEnum
CREATE TYPE "ChecklistPhotoStatus" AS ENUM ('ACTIVE', 'PENDING_DELETE', 'DELETE_FAILED');

-- AlterTable
ALTER TABLE "checklist_photo"
ADD COLUMN "status" "ChecklistPhotoStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "deleteRequestedAt" TIMESTAMP(3),
ADD COLUMN "deleteErrorMessage" TEXT;

-- CreateIndex
CREATE INDEX "checklist_photo_assignmentId_status_fieldId_createdAt_idx"
ON "checklist_photo"("assignmentId", "status", "fieldId", "createdAt");

-- CreateIndex
CREATE INDEX "checklist_photo_status_deleteRequestedAt_idx"
ON "checklist_photo"("status", "deleteRequestedAt");
