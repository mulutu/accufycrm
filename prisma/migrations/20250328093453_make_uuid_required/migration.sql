/*
  Warnings:

  - Made the column `uuid` on table `chatbot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `chatbot` MODIFY `uuid` VARCHAR(191) NOT NULL;
