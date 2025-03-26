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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const websiteUrl = formData.get('websiteUrl') as string;
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

    // Create chatbot with image URLs
    const chatbot = await prisma.chatbot.create({
      data: {
        name,
        description,
        logoUrl,
        avatarUrl,
        userId: session.user.id,
      },
    });

    // Handle website scraping if URL is provided
    if (websiteUrl) {
      try {
        const scrapedContent = await scrapeWebsite(websiteUrl);
        if (scrapedContent) {
          await prisma.knowledgeBase.create({
            data: {
              content: scrapedContent,
              source: 'website',
              sourceUrl: websiteUrl,
              chatbotId: chatbot.id,
            },
          });
        }
      } catch (error) {
        console.error('Error scraping website:', error);
        // Continue without website content
      }
    }

    // Handle document uploads
    for (const doc of documents) {
      if (doc instanceof Blob) {
        const fileData = {
          name: (doc as BlobWithName).name || 'document',
          type: doc.type,
          size: doc.size,
          arrayBuffer: () => doc.arrayBuffer(),
        };
        const fileUrl = await uploadFile(fileData, 'documents');
        
        // Create knowledge base entry for the document
        await prisma.knowledgeBase.create({
          data: {
            content: '', // You might want to extract text from the document here
            source: 'document',
            sourceUrl: fileUrl,
            chatbotId: chatbot.id,
          },
        });
      }
    }

    return NextResponse.json(chatbot);
  } catch (error) {
    console.error('Error creating chatbot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create chatbot' },
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