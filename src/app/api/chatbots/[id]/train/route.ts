import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { trainChatbot } from '@/lib/rag/train';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { websiteUrl, documents } = await req.json();

    // Start training process
    const result = await trainChatbot({
      chatbotId: params.id,
      websiteUrl,
      documents,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error training chatbot:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 