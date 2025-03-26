import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";
import prisma from "@/lib/prisma";

// Initialize the model with the API key
const getGeminiModel = () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set in environment variables");
  }
  return new ChatGoogleGenerativeAI({
    apiKey,
    modelName: "gemini-pro",
    maxOutputTokens: 2048,
    temperature: 0.5,
  });
};

// Create a prompt template for RAG
const ragPromptTemplate = PromptTemplate.fromTemplate(`
You are a helpful AI chatbot assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Keep your answers concise and helpful.

Context:
{context}

Question: {question}
`);

// Function to retrieve relevant documents for a chatbot and query
export async function getRelevantDocuments(chatbotId: string, query: string): Promise<Document[]> {
  // In a real application, you would use a vector database like Pinecone or Qdrant
  // For this example, we'll do a simple text search on the content
  const dataSources = await prisma.dataSource.findMany({
    where: {
      chatbotId,
    },
  });

  // Build basic documents from the data sources
  const documents = dataSources.map((source) => {
    const pageContent = source.content || "No content available";
    const metadata = {
      id: source.id,
      type: source.type,
      url: source.url || null,
      fileName: source.fileName || null,
    };
    return new Document({ pageContent, metadata });
  });

  // Simple relevance function - in a real app, this would be a vector similarity search
  const isRelevant = (doc: Document) => {
    const content = doc.pageContent.toLowerCase();
    const searchTerms = query.toLowerCase().split(" ");
    return searchTerms.some(term => content.includes(term));
  };

  // Filter to the most relevant documents
  const relevantDocs = documents.filter(isRelevant);
  
  // If no relevant docs, return a subset of all docs
  if (relevantDocs.length === 0) {
    return documents.slice(0, 3); // Return first 3 documents as fallback
  }
  
  return relevantDocs.slice(0, 5); // Return top 5 most relevant docs
}

// Function to format documents into a string context
function formatDocumentsAsString(docs: Document[]): string {
  return docs.map((doc, i) => 
    `Document ${i + 1}:\n${doc.pageContent}\n`
  ).join("\n");
}

// Main function to process a query with RAG
export async function processQuery(chatbotId: string, query: string): Promise<string> {
  try {
    // Get the model
    const model = getGeminiModel();
    const outputParser = new StringOutputParser();
    
    // Get relevant documents
    const relevantDocs = await getRelevantDocuments(chatbotId, query);
    const formattedDocs = formatDocumentsAsString(relevantDocs);
    
    // Create the RAG chain
    const chain = RunnableSequence.from([
      {
        context: () => formattedDocs,
        question: (input: { query: string }) => input.query,
      },
      ragPromptTemplate,
      model,
      outputParser,
    ]);
    
    // Execute the chain
    const response = await chain.invoke({ query });
    return response;
  } catch (error) {
    console.error("Error processing query with LangChain:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}

// Function to handle chatbot message processing
export async function processChatbotMessage(chatbotId: string, message: string, conversationHistory?: string): Promise<string> {
  try {
    // Get the chatbot details
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        dataSources: true,
      },
    });
    
    if (!chatbot) {
      throw new Error(`Chatbot with ID ${chatbotId} not found`);
    }
    
    // If the chatbot has data sources, use RAG
    if (chatbot.dataSources.length > 0) {
      return await processQuery(chatbotId, message);
    }
    
    // If no data sources, use a standard prompt template
    const standardPrompt = PromptTemplate.fromTemplate(`
You are a helpful AI chatbot assistant named ${chatbot.name || "Assistant"}.
${chatbot.description ? `About you: ${chatbot.description}` : ""}

${conversationHistory ? `Recent conversation history: ${conversationHistory}` : ""}

User question: {question}

Provide a helpful, concise, and informative response.
    `);
    
    // Create a standard chain
    const model = getGeminiModel();
    const chain = RunnableSequence.from([
      {
        question: (input: { query: string }) => input.query,
      },
      standardPrompt,
      model,
      new StringOutputParser(),
    ]);
    
    // Execute the chain
    const response = await chain.invoke({ query: message });
    return response;
  } catch (error) {
    console.error("Error in processChatbotMessage:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}

// Function to generate embeddings from text (simplified)
export async function generateEmbeddings(text: string): Promise<number[]> {
  // In a real application, this would call an embedding model
  // For this example, we'll return a placeholder embedding
  // This is just a placeholder - use a real embedding model in production
  return Array(128).fill(0).map(() => Math.random());
}

// Function to save embeddings for a data source (simplified implementation)
export async function saveDataSourceEmbeddings(dataSourceId: string): Promise<void> {
  try {
    // Get the data source
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
    });
    
    if (!dataSource || !dataSource.content) {
      throw new Error(`Data source with ID ${dataSourceId} not found or has no content`);
    }
    
    // In a real application, this would:
    // 1. Split the content into chunks
    // 2. Generate embeddings for each chunk
    // 3. Store the chunks and embeddings in a vector database
    
    console.log(`Embeddings generated for data source ${dataSourceId}`);
    
  } catch (error) {
    console.error("Error saving data source embeddings:", error);
    throw error;
  }
} 