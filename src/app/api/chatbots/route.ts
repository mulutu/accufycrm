import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import { scrapeWebsite } from '@/lib/scraper';
import { uploadFile } from '@/lib/storage';
import { Session } from 'next-auth';
import crypto from 'crypto';
import { auth } from '@clerk/nextjs';
import { trainChatbot } from '@/lib/rag/train';

interface BlobWithName extends Blob {
  name?: string;
}

interface SessionWithUser extends Session {
  user: {
    id: string;
  };
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const {
      name,
      description,
      logoUrl,
      avatarUrl,
      websiteUrl,
      primaryColor,
      bubbleMessage,
      welcomeMessage,
      instructions,
      isDarkMode,
      width,
      height,
      documents,
    } = await req.json();

    // Create chatbot in database
    const chatbot = await prisma.chatbot.create({
      data: {
        name,
        description,
        logoUrl,
        avatarUrl,
        websiteUrl,
        primaryColor,
        bubbleMessage,
        welcomeMessage,
        instructions,
        isDarkMode,
        width,
        height,
        userId,
        status: websiteUrl || (documents && documents.length > 0) ? 'TRAINING' : 'READY',
      },
    });

    // Trigger RAG training in the background if needed
    if (websiteUrl || (documents && documents.length > 0)) {
      // Start training process without awaiting
      trainChatbot({
        chatbotId: chatbot.id,
        websiteUrl,
        documents,
      })
        .then(async () => {
          // Update status to READY after successful training
          await prisma.chatbot.update({
            where: { id: chatbot.id },
            data: { status: 'READY' },
          });
        })
        .catch(async (error) => {
          console.error('Error in background training:', error);
          // Update status to TRAINING_FAILED if training fails
          await prisma.chatbot.update({
            where: { id: chatbot.id },
            data: { status: 'TRAINING_FAILED' },
          });
        });
    }

    return NextResponse.json(chatbot);
  } catch (error) {
    console.error('Error creating chatbot:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const chatbots = await prisma.chatbot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(chatbots);
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 