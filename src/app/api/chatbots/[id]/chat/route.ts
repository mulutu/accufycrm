import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Try to find by ID first
    let chatbot = await prisma.chatbot.findFirst({
      where: {
        id: params.id,
      },
      include: {
        knowledgeBase: true,
      },
    });

    // If not found by ID, try UUID
    if (!chatbot) {
      chatbot = await prisma.chatbot.findFirst({
        where: {
          uuid: params.id,
        },
        include: {
          knowledgeBase: true,
        },
      });
    }

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // TODO: Implement actual chat logic using the knowledge base
    // For now, return a simple response
    const response = {
      message: `I received your message: "${message}". This is a placeholder response. The actual chat functionality will be implemented using the chatbot's knowledge base.`,
    };

    // Generate a unique session ID
    const sessionId = crypto.randomUUID();

    // Save the conversation without user ID for public access
    await prisma.conversation.create({
      data: {
        sessionId,
        chatbotId: chatbot.id,
        messages: {
          create: [
            {
              content: message,
              role: 'user',
              chatbotId: chatbot.id,
            },
            {
              content: response.message,
              role: 'assistant',
              chatbotId: chatbot.id,
            },
          ],
        },
      },
    });

    // Add CORS headers
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return nextResponse;
  } catch (error) {
    console.error('Error processing chat message:', error);
    const response = NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
} 