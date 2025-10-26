/*
  Warnings:

  - You are about to drop the column `price` on the `plan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `plan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[annualDiscountPriceId]` on the table `plan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "plan" DROP COLUMN "price",
ADD COLUMN     "annualDiscountPriceId" TEXT,
ALTER COLUMN "freeTrial" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "plan_name_key" ON "plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "plan_annualDiscountPriceId_key" ON "plan"("annualDiscountPriceId");
