-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
