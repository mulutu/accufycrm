const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function updateChatbotUuids() {
  try {
    // Get all chatbots without a UUID
    const chatbots = await prisma.chatbot.findMany({
      where: {
        uuid: null,
      },
    });

    console.log(`Found ${chatbots.length} chatbots without UUIDs`);

    // Update each chatbot with a new UUID
    for (const chatbot of chatbots) {
      await prisma.chatbot.update({
        where: { id: chatbot.id },
        data: { uuid: uuidv4() },
      });
      console.log(`Updated chatbot ${chatbot.id} with UUID`);
    }

    console.log('Successfully updated all chatbot UUIDs');
  } catch (error) {
    console.error('Error updating chatbot UUIDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateChatbotUuids(); 