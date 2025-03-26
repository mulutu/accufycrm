import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import pdfParse from 'pdf-parse';
import { Session } from 'next-auth';
import { scrapeWebsite } from '@/lib/scraper';
import { uploadToS3 } from '@/lib/s3';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const websiteUrl = formData.get('websiteUrl') as string;
    const logo = formData.get('logo') as File | null;
    const avatar = formData.get('avatar') as File | null;
    const documents = formData.getAll('documents') as File[];

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    // Upload images to S3 if provided
    let logoUrl: string | null = null;
    let avatarUrl: string | null = null;

    if (logo) {
      logoUrl = await uploadToS3(logo, 'logos');
    }

    if (avatar) {
      avatarUrl = await uploadToS3(avatar, 'avatars');
    }

    // Create the chatbot
    const chatbot = await prisma.chatbot.create({
      data: {
        name,
        description,
        logoUrl,
        avatarUrl,
        userId: session.user.id,
      },
    });

    // Process and store documents
    for (const file of documents) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Extract text from PDF using pdf-parse
        const data = await pdfParse(buffer);
        const text = data.text;

        // Store the document in the database
        await prisma.document.create({
          data: {
            name: file.name,
            content: text,
            chatbotId: chatbot.id,
            userId: session.user.id,
          },
        });
      } catch (error) {
        console.error('Error processing document:', error);
        // Continue with other documents even if one fails
        continue;
      }
    }

    // Process website content if URL is provided
    if (websiteUrl) {
      try {
        const websiteContent = await scrapeWebsite(websiteUrl);
        
        // Store the website content in the database
        await prisma.document.create({
          data: {
            name: `Website: ${websiteUrl}`,
            content: websiteContent,
            chatbotId: chatbot.id,
            userId: session.user.id,
          },
        });
      } catch (error) {
        console.error('Error processing website:', error);
        // Continue even if website scraping fails
      }
    }

    return NextResponse.json(chatbot);
  } catch (error) {
    console.error('Error creating chatbot:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const chatbots = await prisma.chatbot.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(chatbots);
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 