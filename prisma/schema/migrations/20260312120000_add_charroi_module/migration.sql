-- CreateEnum
CREATE TYPE "ChecklistDeliveryMode" AS ENUM ('IMMEDIATE', 'DIGEST');

-- CreateEnum
CREATE TYPE "ChecklistSubmissionStatus" AS ENUM ('SUBMITTED');

-- CreateEnum
CREATE TYPE "ChecklistNotificationType" AS ENUM ('IMMEDIATE', 'DIGEST');

-- CreateEnum
CREATE TYPE "ChecklistNotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "vehicle" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "plateNumberNormalized" TEXT NOT NULL,
    "name" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_template" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schemaJson" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_checklist_assignment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "checklistTemplateId" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_checklist_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_category" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultDeliveryMode" "ChecklistDeliveryMode" NOT NULL DEFAULT 'IMMEDIATE',
    "defaultDigestCron" TEXT,
    "timeZone" TEXT NOT NULL DEFAULT 'Europe/Brussels',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastDigestRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_member_subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "deliveryModeOverride" "ChecklistDeliveryMode",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_member_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_submission" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "vehicleId" TEXT,
    "checklistTemplateId" TEXT,
    "submitterName" TEXT NOT NULL,
    "responseJson" JSONB NOT NULL,
    "schemaSnapshotJson" JSONB NOT NULL,
    "status" "ChecklistSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "vehiclePlateNumberSnapshot" TEXT NOT NULL,
    "vehicleNameSnapshot" TEXT,
    "checklistNameSnapshot" TEXT NOT NULL,
    "checklistVersionSnapshot" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_issue" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "categoryId" TEXT,
    "ruleId" TEXT NOT NULL,
    "ruleTitle" TEXT NOT NULL,
    "description" TEXT,
    "triggeredFieldIdsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_photo" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "submissionId" TEXT,
    "fieldId" TEXT NOT NULL,
    "tempUploadKey" TEXT,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_notification_delivery" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "recipientMemberId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "notificationType" "ChecklistNotificationType" NOT NULL,
    "status" "ChecklistNotificationStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT NOT NULL,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_notification_delivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicle_organizationId_isActive_idx" ON "vehicle"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_organizationId_plateNumberNormalized_key" ON "vehicle"("organizationId", "plateNumberNormalized");

-- CreateIndex
CREATE INDEX "checklist_template_organizationId_isActive_idx" ON "checklist_template"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_template_organizationId_name_key" ON "checklist_template"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_checklist_assignment_publicToken_key" ON "vehicle_checklist_assignment"("publicToken");

-- CreateIndex
CREATE INDEX "vehicle_checklist_assignment_organizationId_isActive_idx" ON "vehicle_checklist_assignment"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_checklist_assignment_vehicleId_checklistTemplateId_key" ON "vehicle_checklist_assignment"("vehicleId", "checklistTemplateId");

-- CreateIndex
CREATE INDEX "checklist_category_organizationId_isActive_idx" ON "checklist_category"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_category_organizationId_name_key" ON "checklist_category"("organizationId", "name");

-- CreateIndex
CREATE INDEX "checklist_member_subscription_organizationId_memberId_idx" ON "checklist_member_subscription"("organizationId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_member_subscription_categoryId_memberId_key" ON "checklist_member_subscription"("categoryId", "memberId");

-- CreateIndex
CREATE INDEX "checklist_submission_organizationId_submittedAt_idx" ON "checklist_submission"("organizationId", "submittedAt");

-- CreateIndex
CREATE INDEX "checklist_submission_assignmentId_submittedAt_idx" ON "checklist_submission"("assignmentId", "submittedAt");

-- CreateIndex
CREATE INDEX "checklist_issue_organizationId_categoryId_idx" ON "checklist_issue"("organizationId", "categoryId");

-- CreateIndex
CREATE INDEX "checklist_issue_submissionId_idx" ON "checklist_issue"("submissionId");

-- CreateIndex
CREATE INDEX "checklist_photo_organizationId_tempUploadKey_idx" ON "checklist_photo"("organizationId", "tempUploadKey");

-- CreateIndex
CREATE INDEX "checklist_photo_submissionId_fieldId_idx" ON "checklist_photo"("submissionId", "fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_notification_delivery_idempotencyKey_key" ON "checklist_notification_delivery"("idempotencyKey");

-- CreateIndex
CREATE INDEX "checklist_notification_delivery_organizationId_status_notif_idx" ON "checklist_notification_delivery"("organizationId", "status", "notificationType");

-- CreateIndex
CREATE INDEX "checklist_notification_delivery_categoryId_recipientMemberI_idx" ON "checklist_notification_delivery"("categoryId", "recipientMemberId", "notificationType");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_notification_delivery_submissionId_categoryId_rec_key" ON "checklist_notification_delivery"("submissionId", "categoryId", "recipientMemberId", "notificationType");

-- AddForeignKey
ALTER TABLE "vehicle_checklist_assignment" ADD CONSTRAINT "vehicle_checklist_assignment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_checklist_assignment" ADD CONSTRAINT "vehicle_checklist_assignment_checklistTemplateId_fkey" FOREIGN KEY ("checklistTemplateId") REFERENCES "checklist_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_member_subscription" ADD CONSTRAINT "checklist_member_subscription_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "checklist_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_submission" ADD CONSTRAINT "checklist_submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "vehicle_checklist_assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_submission" ADD CONSTRAINT "checklist_submission_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_submission" ADD CONSTRAINT "checklist_submission_checklistTemplateId_fkey" FOREIGN KEY ("checklistTemplateId") REFERENCES "checklist_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_issue" ADD CONSTRAINT "checklist_issue_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "checklist_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_issue" ADD CONSTRAINT "checklist_issue_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "checklist_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_photo" ADD CONSTRAINT "checklist_photo_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "vehicle_checklist_assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_photo" ADD CONSTRAINT "checklist_photo_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "checklist_submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_notification_delivery" ADD CONSTRAINT "checklist_notification_delivery_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "checklist_submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_notification_delivery" ADD CONSTRAINT "checklist_notification_delivery_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "checklist_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

