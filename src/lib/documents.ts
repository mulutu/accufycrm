import { prisma } from '@/lib/prisma';

interface CreateDocumentParams {
  name: string;
  content: string;
  chatbotId: string;
  userId: string;
}

export async function createDocument({ name, content, chatbotId, userId }: CreateDocumentParams) {
  try {
    const document = await prisma.document.create({
      data: {
        name,
        content,
        chatbotId,
        userId,
      },
    });

    return document;
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document');
  }
}

export async function createDocumentsFromScrapedContent(
  url: string,
  content: string,
  chatbotId: string,
  userId: string
) {
  try {
    // Split content into chunks of 1000 characters
    const chunkSize = 1000;
    const chunks = content.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
    
    // Create documents for each chunk
    const documents = await Promise.all(
      chunks.map((chunk, index) => 
        createDocument({
          name: `${url} - Part ${index + 1}`,
          content: chunk,
          chatbotId,
          userId,
        })
      )
    );

    return documents;
  } catch (error) {
    console.error('Error creating documents from scraped content:', error);
    throw new Error('Failed to create documents from scraped content');
  }
} 