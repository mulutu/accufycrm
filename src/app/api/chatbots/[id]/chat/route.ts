import { NextResponse } from "next/server";
import { ConvexHttpClient, ConvexVectorStore } from '@langchain/convex';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Get environment variables
const convexUrl = process.env.CONVEX_URL; // URL from Convex deployment
const geminiApiKey = process.env.GEMINI_API_KEY;

// Basic check on startup
if (!convexUrl) {
  console.error("FATAL ERROR: CONVEX_URL environment variable not set.");
}
if (!geminiApiKey) {
  console.error("FATAL ERROR: GEMINI_API_KEY environment variable not set.");
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Ensure required env vars are loaded
  if (!convexUrl || !geminiApiKey) {
     console.error("Chat route error: Missing CONVEX_URL or GEMINI_API_KEY");
     return addCorsHeaders(NextResponse.json(
       { error: 'Server configuration error. Please check logs.' },
       { status: 500 }
     ));
  }

  try {
    const { message } = await request.json();
    const chatbotId = params.id; // This is the MySQL chatbot ID

    if (!message || typeof message !== 'string') {
        return addCorsHeaders(NextResponse.json({ error: 'Invalid message format' }, { status: 400 }));
    }

    console.log(`Chat request for chatbot (MySQL ID): ${chatbotId}, Message: "${message}"`);

    // --- RAG Implementation using Langchain and Convex --- 

    // 1. Initialize Embeddings Model
    const embeddings = new GoogleGenerativeAIEmbeddings({
       apiKey: geminiApiKey,
       // model: "text-embedding-004", // Model assumed by default?
    });

    // 2. Initialize Convex Vector Store
    // Requires an HTTP client to connect from Next.js server to Convex
    const convexClient = new ConvexHttpClient(convexUrl);
    const vectorStore = new ConvexVectorStore(embeddings, { 
        client: convexClient,
        // Optional: specify the table name if different from default ('documents')
        // tableName: "document_chunks"
    });

    // 3. Initialize LLM
    const llm = new ChatGoogleGenerativeAI({
      apiKey: geminiApiKey,
      // model: "gemini-1.5-flash", // Removed - Rely on default/environment config
      temperature: 0.3, 
      // safetySettings: [], // Optional: Adjust safety settings if needed
      // generationConfig: { maxOutputTokens: 512 }, // Optional: Limit output tokens
    });

    // 4. Define Prompt Template
    const questionAnsweringPrompt = PromptTemplate.fromTemplate(
      `You are an AI assistant for a chatbot. 
       Answer the user's question based *only* on the context provided below. 
       If the context doesn't contain the answer, state that you don't have enough information from the provided documents. 
       Do not make up information or answer based on prior knowledge outside the context. Be concise.

       Context:
       {context}

       Question: {question}

       Helpful Answer:`
    );

    // 5. Create Retriever
    const retriever = vectorStore.asRetriever({
        k: 4, // Retrieve top 4 most relevant chunks
        // Explicitly type the filter function parameter
        filter: (filter: any) => filter.eq("metadata.chatbotId", chatbotId), 
        // verbose: true, // Uncomment for debugging retriever results
    });

    // 6. Define RAG Chain
    const ragChain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString), // Get context docs and format as string
        question: (input) => input.question, // Pass question through
      },
      questionAnsweringPrompt, // Apply prompt template
      llm, // Call the LLM
      new StringOutputParser(), // Parse the LLM response as a string
    ]);

    // Optional: Fetch chatbot name from MySQL to potentially use in prompt (not currently used in template above)
    // let chatbotName = "Assistant";
    // try {
    //     const chatbotDetails = await prisma.chatbot.findUnique({ where: { id: chatbotId }, select: { name: true } });
    //     if (chatbotDetails?.name) chatbotName = chatbotDetails.name;
    // } catch (prismaError) { console.warn(`Could not fetch chatbot name for ${chatbotId}:`, prismaError); }

    // 7. Invoke RAG Chain
    console.log(`Invoking RAG chain for chatbot ${chatbotId}...`);
    const responseText = await ragChain.invoke({ question: message });
    console.log(`RAG chain response for chatbot ${chatbotId}: "${responseText}"`);

    // 8. Store Conversation History (in MySQL via Prisma)
    // Using a background task for this might be better in production to not delay response
    try {
      await prisma.conversation.create({
        data: {
          chatbotId: chatbotId,
          sessionId: crypto.randomUUID(), // Consider a more robust session management
          messages: {
            create: [
              { content: message, role: 'user', chatbotId: chatbotId },
              { content: responseText, role: 'assistant', chatbotId: chatbotId },
            ],
          },
        },
      });
      console.log(`Conversation history saved for chatbot ${chatbotId}`);
    } catch (dbError) {
      console.error(`Error saving conversation to Prisma for chatbot ${chatbotId}:`, dbError);
      // Log error but don't fail the request
    }

    // 9. Return Response
    return addCorsHeaders(NextResponse.json({ response: responseText }));

  } catch (error: any) {
    console.error(`Error processing chat message for chatbot ${params.id}:`, error);
    let errorMessage = 'Failed to process chat message.';
    // Provide more specific feedback if possible
    if (error.message?.includes('embedding')) {
        errorMessage = 'Failed to process message context.';
    } else if (error.message?.includes('vector search') || error.message?.includes('vectorIndex')) {
        errorMessage = 'Failed to retrieve relevant information.';
    } else if (error.message?.includes('generateContent') || error.name === 'GoogleGenerativeAIFetchError') {
        errorMessage = 'Failed to generate AI response.';
    }
    return addCorsHeaders(NextResponse.json(
      { error: errorMessage, details: error.message }, // Include original message in details
      { status: 500 }
    ));
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
} 