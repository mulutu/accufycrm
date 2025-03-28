/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `Chatbot` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `chatbot` ADD COLUMN `bubbleMessage` VARCHAR(191) NOT NULL DEFAULT 'Chat with us!',
    ADD COLUMN `height` INTEGER NOT NULL DEFAULT 600,
    ADD COLUMN `instructions` VARCHAR(191) NULL,
    ADD COLUMN `isDarkMode` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `primaryColor` VARCHAR(191) NOT NULL DEFAULT '#000000',
    ADD COLUMN `uuid` VARCHAR(191) NULL,
    ADD COLUMN `welcomeMessage` VARCHAR(191) NOT NULL DEFAULT 'Hello! I''m your AI assistant. How can I help you today?',
    ADD COLUMN `width` INTEGER NOT NULL DEFAULT 400;

-- CreateIndex
CREATE UNIQUE INDEX `Chatbot_uuid_key` ON `Chatbot`(`uuid`);
