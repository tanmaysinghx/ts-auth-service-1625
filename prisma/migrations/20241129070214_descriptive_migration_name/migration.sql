/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `Otp` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Otp_email_idx` ON `Otp`;

-- AlterTable
ALTER TABLE `Otp` DROP COLUMN `deletedAt`,
    DROP COLUMN `ipAddress`;
