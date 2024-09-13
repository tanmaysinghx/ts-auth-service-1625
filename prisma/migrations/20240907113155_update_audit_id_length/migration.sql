/*
  Warnings:

  - The primary key for the `audit` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `audit` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    MODIFY `userId` VARCHAR(36) NOT NULL,
    MODIFY `roleId` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);
