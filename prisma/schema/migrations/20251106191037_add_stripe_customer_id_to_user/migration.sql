/*
  Warnings:

  - You are about to drop the column `createdAt` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `subscription` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_referenceId_fkey";

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "stripeCustomerId" TEXT;
