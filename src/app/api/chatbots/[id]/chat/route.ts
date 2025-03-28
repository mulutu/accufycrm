import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { message } = await request.json();
    console.log('Received request for chatbot:', params.id);
    console.log('Message:', message);

    // Try to find chatbot by ID first
    let chatbot = await prisma.chatbot.findFirst({
      where: { id: params.id },
      include: {
        documents: true,
      },
    });

    // If not found by ID, try UUID
    if (!chatbot) {
      chatbot = await prisma.chatbot.findFirst({
        where: { uuid: params.id },
        include: {
          documents: true,
        },
      });
    }

    if (!chatbot) {
      console.error('Chatbot not found:', params.id);
      return addCorsHeaders(NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      ));
    }

    console.log('Found chatbot with', chatbot.documents.length, 'documents');

    // Get relevant documents for context
    const documents = await prisma.document.findMany({
      where: {
        chatbotId: chatbot.id,
      },
      take: 5, // Limit to 5 most relevant documents
    });

    // Prepare context from documents
    const context = documents
      .map(doc => doc.content)
      .join('\n\n')
      .slice(0, 1000); // Limit context length

    console.log('Context length:', context.length);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    // Generate response
    const prompt = `Context: ${context}\n\nUser: ${message}\n\nAssistant:`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Store the conversation
    await prisma.conversation.create({
      data: {
        chatbotId: chatbot.id,
        sessionId: crypto.randomUUID(),
        messages: {
          create: [
            {
              content: message,
              role: 'user',
              chatbotId: chatbot.id,
            },
            {
              content: text,
              role: 'assistant',
              chatbotId: chatbot.id,
            },
          ],
        },
      },
    });

    return addCorsHeaders(NextResponse.json({ response: text }));
  } catch (error) {
    console.error('Error processing chat message:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    ));
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
} 