-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(8) NOT NULL,
    `email` VARCHAR(255) NULL,
    `password` VARCHAR(255) NULL,
    `roleId` VARCHAR(4) NULL,
    `lastLoginAt` DATETIME(6) NULL,
    `createdAt` DATETIME(6) NULL,
    `updatedAt` DATETIME(6) NULL,

    UNIQUE INDEX `UKt7gueymdut91qb606y2pyjpq0`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(4) NOT NULL,
    `roleName` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Role_roleName_key`(`roleName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `billing` (
    `billing_id` VARCHAR(255) NOT NULL,
    `billing_code` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,

    PRIMARY KEY (`billing_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_table` (
    `group_id` VARCHAR(255) NOT NULL,
    `group_name` VARCHAR(255) NULL,
    `group_owner` VARCHAR(255) NULL,

    PRIMARY KEY (`group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project` (
    `project_id` VARCHAR(255) NOT NULL,
    `project_name` VARCHAR(255) NULL,
    `project_owner` VARCHAR(255) NULL,

    PRIMARY KEY (`project_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team` (
    `team_id` VARCHAR(255) NOT NULL,
    `team_name` VARCHAR(255) NULL,
    `team_owner` VARCHAR(255) NULL,

    PRIMARY KEY (`team_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profile` (
    `profile_id` VARCHAR(255) NOT NULL,
    `billing_id` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(6) NULL,
    `email_id` VARCHAR(255) NOT NULL,
    `group_id` VARCHAR(255) NOT NULL,
    `manager_email_id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `project_id` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL,
    `team_id` VARCHAR(255) NOT NULL,
    `updated_at` DATETIME(6) NULL,

    UNIQUE INDEX `UKfao4dbg2pu8f1ii154tx562s6`(`email_id`),
    PRIMARY KEY (`profile_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

