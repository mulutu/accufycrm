-- AlterTable
ALTER TABLE `chatbot` ADD COLUMN `avatarUrl` VARCHAR(191) NULL,
    ADD COLUMN `logoUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `datasource` MODIFY `content` TEXT NULL;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `chatbotId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KnowledgeBase` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `sourceUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `chatbotId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_chatbotId_fkey` FOREIGN KEY (`chatbotId`) REFERENCES `Chatbot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KnowledgeBase` ADD CONSTRAINT `KnowledgeBase_chatbotId_fkey` FOREIGN KEY (`chatbotId`) REFERENCES `Chatbot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
