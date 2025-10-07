-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "status" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN,
    "seats" INTEGER,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_referenceId_key" ON "subscription"("referenceId");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
