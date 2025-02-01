-- AlterTable
ALTER TABLE `Otp` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `ipAddress` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Otp_email_idx` ON `Otp`(`email`);
