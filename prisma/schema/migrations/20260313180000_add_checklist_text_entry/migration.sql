-- CreateTable
CREATE TABLE "checklist_text_entry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "submissionId" TEXT,
    "fieldId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_text_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "checklist_text_entry_organizationId_fieldId_idx" ON "checklist_text_entry"("organizationId", "fieldId");

-- CreateIndex
CREATE INDEX "checklist_text_entry_assignmentId_fieldId_createdAt_idx" ON "checklist_text_entry"("assignmentId", "fieldId", "createdAt");

-- CreateIndex
CREATE INDEX "checklist_text_entry_submissionId_fieldId_idx" ON "checklist_text_entry"("submissionId", "fieldId");

-- AddForeignKey
ALTER TABLE "checklist_text_entry" ADD CONSTRAINT "checklist_text_entry_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "vehicle_checklist_assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_text_entry" ADD CONSTRAINT "checklist_text_entry_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "checklist_submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
