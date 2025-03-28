import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check if the URL is already associated with a chatbot
    const existingChatbot = await prisma.chatbot.findFirst({
      where: {
        websiteUrl: url,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({
      exists: !!existingChatbot,
      chatbot: existingChatbot,
    });
  } catch (error) {
    console.error('Error checking website:', error);
    return NextResponse.json(
      { error: 'Failed to check website' },
      { status: 500 }
    );
  }
} 