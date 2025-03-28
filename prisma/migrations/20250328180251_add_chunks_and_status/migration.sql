/*
  Warnings:

  - You are about to drop the column `instructions` on the `chatbot` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `chatbot` DROP FOREIGN KEY `Chatbot_userId_fkey`;

-- AlterTable
ALTER TABLE `chatbot` DROP COLUMN `instructions`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    MODIFY `bubbleMessage` VARCHAR(191) NULL,
    MODIFY `welcomeMessage` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Chunk` (
    `id` VARCHAR(191) NOT NULL,
    `chatbotId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `embedding` VARCHAR(191) NOT NULL,
    `metadata` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Chunk_chatbotId_idx`(`chatbotId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Chatbot` ADD CONSTRAINT `Chatbot_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chunk` ADD CONSTRAINT `Chunk_chatbotId_fkey` FOREIGN KEY (`chatbotId`) REFERENCES `Chatbot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
