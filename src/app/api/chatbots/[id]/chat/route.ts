import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';
import { queryChatbot } from '@/lib/rag/query';

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { message } = await req.json();

    // Get the chatbot
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: params.id },
    });

    if (!chatbot) {
      return addCorsHeaders(new NextResponse('Chatbot not found', { status: 404 }));
    }

    // Get or create conversation
    const conversation = await prisma.conversation.create({
      data: {
        sessionId: crypto.randomUUID(),
        chatbotId: params.id,
        userIp: req.headers.get('x-forwarded-for') || 'unknown',
        country: req.headers.get('cf-ipcountry') || 'unknown',
        device: req.headers.get('user-agent') || 'unknown',
        browser: req.headers.get('sec-ch-ua') || 'unknown',
      },
    });

    // Save user message
    await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        chatbotId: params.id,
        conversationId: conversation.id,
      },
    });

    // Get response using RAG
    const response = await queryChatbot(chatbot.id, message);

    // Save assistant message
    await prisma.message.create({
      data: {
        content: response.message,
        role: 'assistant',
        chatbotId: params.id,
        conversationId: conversation.id,
      },
    });

    return addCorsHeaders(NextResponse.json({
      message: response.message,
      sources: response.sources,
    }));
  } catch (error) {
    console.error('Error processing chat message:', error);
    return addCorsHeaders(new NextResponse('Internal Server Error', { status: 500 }));
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
} 