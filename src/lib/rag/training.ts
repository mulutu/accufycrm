import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Document } from 'langchain/document';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: 'embedding-001',
  apiKey: process.env.GOOGLE_API_KEY || '',
});

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

// Text splitter for chunking documents
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', ' ', ''],
});

interface TrainingData {
  chatbotId: string;
  documents: {
    content: string;
    metadata: {
      source: string;
      type: 'website' | 'document';
      url?: string;
      filename?: string;
    };
  }[];
}

export async function processTrainingData(data: TrainingData) {
  try {
    const { chatbotId, documents } = data;
    
    // Process each document
    for (const doc of documents) {
      // Split the document into chunks
      const chunks = await textSplitter.createDocuments([doc.content]);
      
      // Generate embeddings for each chunk
      const embeddingsList = await embeddings.embedDocuments(
        chunks.map(chunk => chunk.pageContent)
      );
      
      // Store chunks and embeddings in Convex
      for (let i = 0; i < chunks.length; i++) {
        await convex.mutation(api.chunks.store, {
          chatbotId,
          content: chunks[i].pageContent,
          embedding: embeddingsList[i],
          metadata: {
            ...doc.metadata,
            chunkIndex: i,
            totalChunks: chunks.length,
          },
        });
      }
    }
    
    // Update chatbot status in Prisma
    await prisma.chatbot.update({
      where: { id: chatbotId },
      data: { status: 'trained' },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error processing training data:', error);
    throw error;
  }
}

export async function scrapeWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Basic HTML to text conversion
    const text = html
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return text;
  } catch (error) {
    console.error('Error scraping website:', error);
    throw error;
  }
}

export async function processDocument(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text;
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
} 