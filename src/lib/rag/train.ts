import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: 'embedding-001',
  apiKey: process.env.GOOGLE_API_KEY || '',
});

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

// Initialize text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', ' ', ''],
});

interface TrainingOptions {
  chatbotId: string;
  websiteUrl?: string;
  documents?: {
    content: Buffer;
    filename: string;
    type: string;
  }[];
}

export async function trainChatbot({ chatbotId, websiteUrl, documents }: TrainingOptions) {
  try {
    const chunks: { content: string; metadata: any }[] = [];

    // Process website content if URL is provided
    if (websiteUrl) {
      const loader = new CheerioWebBaseLoader(websiteUrl);
      const docs = await loader.load();
      const websiteChunks = await textSplitter.splitDocuments(docs);
      
      chunks.push(...websiteChunks.map(chunk => ({
        content: chunk.pageContent,
        metadata: {
          source: websiteUrl,
          type: 'website',
          url: websiteUrl,
        },
      })));
    }

    // Process uploaded documents
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        let loader;
        
        // Select appropriate loader based on file type
        switch (doc.type) {
          case 'application/pdf':
            loader = new PDFLoader(doc.content);
            break;
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            loader = new DocxLoader(doc.content);
            break;
          default:
            console.warn(`Unsupported document type: ${doc.type}`);
            continue;
        }

        const docs = await loader.load();
        const docChunks = await textSplitter.splitDocuments(docs);
        
        chunks.push(...docChunks.map(chunk => ({
          content: chunk.pageContent,
          metadata: {
            source: doc.filename,
            type: 'document',
            filename: doc.filename,
          },
        })));
      }
    }

    // Generate embeddings for chunks
    const embeddingsList = await embeddings.embedDocuments(
      chunks.map(chunk => chunk.content)
    );

    // Store chunks and embeddings in Convex
    for (let i = 0; i < chunks.length; i++) {
      await convex.mutation(api.chunks.create, {
        chatbotId,
        content: chunks[i].content,
        metadata: chunks[i].metadata,
        embedding: embeddingsList[i],
      });
    }

    return {
      success: true,
      message: `Successfully processed ${chunks.length} chunks`,
    };
  } catch (error) {
    console.error('Error training chatbot:', error);
    throw error;
  }
} 