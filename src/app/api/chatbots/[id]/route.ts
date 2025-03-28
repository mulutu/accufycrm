import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for updating a chatbot
const updateChatbotSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  primaryColor: z.string().optional(),
  logoUrl: z.string().optional(),
  welcomeMessage: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching chatbot with ID/UUID:', params.id);
    
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
        websiteUrl: true,
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
          websiteUrl: true,
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

    // Format the logo and avatar URLs with the application's base URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const formattedChatbot = {
      ...chatbot,
      logoUrl: chatbot.logoUrl ? `${appUrl}${chatbot.logoUrl}` : null,
      avatarUrl: chatbot.avatarUrl ? `${appUrl}${chatbot.avatarUrl}` : null,
    };

    // Create response with CORS headers
    const response = NextResponse.json(formattedChatbot);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch chatbot configuration' },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if chatbot exists and belongs to user
    const chatbot = await prisma.chatbot.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!chatbot) {
      return NextResponse.json(
        { message: "Chatbot not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = updateChatbotSchema.parse(body);

    const updatedChatbot = await prisma.chatbot.update({
      where: {
        id: params.id,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedChatbot);
  } catch (error) {
    console.error("Error updating chatbot:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if chatbot exists and belongs to user
    const chatbot = await prisma.chatbot.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!chatbot) {
      return NextResponse.json(
        { message: "Chatbot not found" },
        { status: 404 }
      );
    }

    // Delete chatbot and all associated data (cascading delete is set up in Prisma schema)
    await prisma.chatbot.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      { message: "Chatbot deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting chatbot:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
} 