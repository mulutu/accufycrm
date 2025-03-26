import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import { scrapeWebsite } from '@/lib/scraper';
import { uploadFile } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const websiteUrl = formData.get('websiteUrl') as string;
    const logo = formData.get('logo') as File | null;
    const avatar = formData.get('avatar') as File | null;
    const documents = formData.getAll('documents') as File[];

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Upload images if provided
    let logoUrl: string | null = null;
    let avatarUrl: string | null = null;

    if (logo) {
      logoUrl = await uploadFile(logo, 'logos');
    }

    if (avatar) {
      avatarUrl = await uploadFile(avatar, 'avatars');
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
        // Continue without website content if scraping fails
      }
    }

    // Handle document uploads
    if (documents.length > 0) {
      const documentPromises = documents.map(async (file) => {
        const fileUrl = await uploadFile(file, 'documents');
        return prisma.knowledgeBase.create({
          data: {
            content: file.name, // You might want to extract text content from the file
            source: 'document',
            sourceUrl: fileUrl,
            chatbotId: chatbot.id,
          },
        });
      });

      await Promise.all(documentPromises);
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