import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get the chatbot and its knowledge base
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: params.id,
      },
      include: {
        knowledgeBase: true,
      },
    });

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

    // Save the conversation
    await prisma.conversation.create({
      data: {
        sessionId,
        chatbotId: chatbot.id,
        messages: {
          create: [
            {
              content: message,
              role: 'user',
              userId: session.user.id,
              chatbotId: chatbot.id,
            },
            {
              content: response.message,
              role: 'assistant',
              userId: session.user.id,
              chatbotId: chatbot.id,
            },
          ],
        },
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 