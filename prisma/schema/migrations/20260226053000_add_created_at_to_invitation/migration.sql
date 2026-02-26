-- AddColumn: invitation.createdAt
-- Required by Better-Auth 1.4.18+ for createInvitation()
ALTER TABLE "invitation" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
