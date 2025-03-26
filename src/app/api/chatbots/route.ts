import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import pdfParse from 'pdf-parse';
import { Session } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const documents = formData.getAll('documents') as File[];

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    // Create the chatbot
    const chatbot = await prisma.chatbot.create({
      data: {
        name,
        description,
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