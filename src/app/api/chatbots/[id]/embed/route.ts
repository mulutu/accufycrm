import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Generating embed script for ID/UUID:', params.id);
    
    // Try to find by ID first
    let chatbot = await prisma.chatbot.findFirst({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        uuid: true,
        name: true,
        description: true,
        logoUrl: true,
        avatarUrl: true,
        primaryColor: true,
        bubbleMessage: true,
        welcomeMessage: true,
        instructions: true,
        isDarkMode: true,
        width: true,
        height: true,
      },
    });

    // If not found by ID, try UUID
    if (!chatbot) {
      chatbot = await prisma.chatbot.findFirst({
        where: {
          uuid: params.id,
        },
        select: {
          id: true,
          uuid: true,
          name: true,
          description: true,
          logoUrl: true,
          avatarUrl: true,
          primaryColor: true,
          bubbleMessage: true,
          welcomeMessage: true,
          instructions: true,
          isDarkMode: true,
          width: true,
          height: true,
        },
      });
    }

    console.log('Found chatbot:', chatbot);

    if (!chatbot) {
      console.log('Chatbot not found');
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    const embedScript = `
      <script>
        window.CHATBOT_CONFIG = ${JSON.stringify({
          id: chatbot.id,
          uuid: chatbot.uuid,
          name: chatbot.name,
          description: chatbot.description,
          logoUrl: chatbot.logoUrl,
          avatarUrl: chatbot.avatarUrl,
          primaryColor: chatbot.primaryColor,
          bubbleMessage: chatbot.bubbleMessage,
          welcomeMessage: chatbot.welcomeMessage,
          instructions: chatbot.instructions,
          isDarkMode: chatbot.isDarkMode,
          width: chatbot.width,
          height: chatbot.height,
        })};
      </script>
      <script src="/chatbot.js"></script>
    `;

    return new NextResponse(embedScript, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating embed script:', error);
    return NextResponse.json(
      { error: 'Failed to generate embed script' },
      { status: 500 }
    );
  }
} 