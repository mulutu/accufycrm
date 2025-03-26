import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for creating a data source
const createDataSourceSchema = z.object({
  type: z.string(),
  url: z.string().url().optional(),
  content: z.string().optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
});

export async function POST(
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
    const validatedData = createDataSourceSchema.parse(body);

    // Create data source
    const dataSource = await prisma.dataSource.create({
      data: {
        ...validatedData,
        chatbotId: params.id,
      },
    });

    return NextResponse.json(dataSource, { status: 201 });
  } catch (error) {
    console.error("Error creating data source:", error);

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

export async function GET(
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

    // Get all data sources for this chatbot
    const dataSources = await prisma.dataSource.findMany({
      where: {
        chatbotId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(dataSources);
  } catch (error) {
    console.error("Error fetching data sources:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
} 