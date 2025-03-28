/*
  Warnings:

  - You are about to drop the column `status` on the `chatbot` table. All the data in the column will be lost.
  - You are about to drop the `chunk` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `bubbleMessage` on table `chatbot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `welcomeMessage` on table `chatbot` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `chatbot` DROP FOREIGN KEY `Chatbot_userId_fkey`;

-- DropForeignKey
ALTER TABLE `chunk` DROP FOREIGN KEY `Chunk_chatbotId_fkey`;

-- AlterTable
ALTER TABLE `chatbot` DROP COLUMN `status`,
    ADD COLUMN `instructions` VARCHAR(191) NULL,
    MODIFY `bubbleMessage` VARCHAR(191) NOT NULL DEFAULT 'Chat with us!',
    MODIFY `welcomeMessage` VARCHAR(191) NOT NULL DEFAULT 'Hello! I''m your AI assistant. How can I help you today?';

-- DropTable
DROP TABLE `chunk`;

-- AddForeignKey
ALTER TABLE `Chatbot` ADD CONSTRAINT `Chatbot_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
