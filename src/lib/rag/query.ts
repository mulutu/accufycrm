import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: 'embedding-001',
  apiKey: process.env.GOOGLE_API_KEY || '',
});

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

interface QueryResult {
  message: string;
  sources: {
    content: string;
    metadata: {
      source: string;
      type: 'website' | 'document';
      url?: string;
      filename?: string;
    };
  }[];
}

export async function queryChatbot(chatbotId: string, query: string): Promise<QueryResult> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await embeddings.embedQuery(query);
    
    // Retrieve relevant chunks from Convex
    const chunks = await convex.query(api.chunks.search, {
      chatbotId,
      embedding: queryEmbedding,
      limit: 5,
    });
    
    // Prepare context from relevant chunks
    const context = chunks
      .map(chunk => chunk.content)
      .join('\n\n');
    
    // Generate response using Gemini
    const prompt = `Context: ${context}\n\nQuestion: ${query}\n\nAnswer:`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return {
      message: response,
      sources: chunks.map(chunk => ({
        content: chunk.content,
        metadata: chunk.metadata,
      })),
    };
  } catch (error) {
    console.error('Error querying chatbot:', error);
    throw error;
  }
} 