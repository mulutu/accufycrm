import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import { scrapeWebsite } from '@/lib/scraper';
import { uploadFile } from '@/lib/storage';
import { Session } from 'next-auth';

interface BlobWithName extends Blob {
  name?: string;
}

interface SessionWithUser extends Session {
  user: {
    id: string;
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const websiteUrl = formData.get('websiteUrl') as string;
    const primaryColor = formData.get('primaryColor') as string;
    const bubbleMessage = formData.get('bubbleMessage') as string;
    const welcomeMessage = formData.get('welcomeMessage') as string;
    const instructions = formData.get('instructions') as string;
    const isDarkMode = formData.get('isDarkMode') === 'true';
    const width = parseInt(formData.get('width') as string);
    const height = parseInt(formData.get('height') as string);
    const logo = formData.get('logo');
    const avatar = formData.get('avatar');
    const documents = formData.getAll('documents');

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Upload images if provided
    let logoUrl: string | null = null;
    let avatarUrl: string | null = null;

    if (logo instanceof Blob) {
      const fileData = {
        name: (logo as BlobWithName).name || 'logo',
        type: logo.type,
        size: logo.size,
        arrayBuffer: () => logo.arrayBuffer(),
      };
      logoUrl = await uploadFile(fileData, 'logos');
    }

    if (avatar instanceof Blob) {
      const fileData = {
        name: (avatar as BlobWithName).name || 'avatar',
        type: avatar.type,
        size: avatar.size,
        arrayBuffer: () => avatar.arrayBuffer(),
      };
      avatarUrl = await uploadFile(fileData, 'avatars');
    }

    // Create the chatbot
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
        userId: session.user.id,
      },
    });

    // Handle website scraping if URL is provided
    if (websiteUrl) {
      try {
        // Create a data source for the website
        await prisma.dataSource.create({
          data: {
            type: 'website',
            url: websiteUrl,
            chatbotId: chatbot.id,
          },
        });

        // Scrape the website and create documents
        await scrapeWebsite(websiteUrl, chatbot.id, session.user.id);
      } catch (error) {
        console.error('Error scraping website:', error);
        // Continue with document uploads even if scraping fails
      }
    }

    // Handle document uploads
    for (const doc of documents) {
      if (doc instanceof Blob) {
        try {
          const fileData = {
            name: (doc as BlobWithName).name || 'document',
            type: doc.type,
            size: doc.size,
            arrayBuffer: () => doc.arrayBuffer(),
          };
          const content = await uploadFile(fileData, 'documents');
          
          // Create document record
          await prisma.document.create({
            data: {
              name: (doc as BlobWithName).name || 'document',
              content,
              chatbotId: chatbot.id,
              userId: session.user.id,
            },
          });
        } catch (error) {
          console.error('Error uploading document:', error);
          // Continue with other documents even if one fails
        }
      }
    }

    return NextResponse.json(chatbot);
  } catch (error) {
    console.error('Error creating chatbot:', error);
    return NextResponse.json(
      { error: 'Failed to create chatbot' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatbots = await prisma.chatbot.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        knowledgeBase: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(chatbots);
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chatbots' },
      { status: 500 }
    );
  }
} 