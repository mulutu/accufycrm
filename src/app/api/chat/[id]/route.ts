import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { processChatbotMessage } from "@/lib/ai/langchain";

// Schema for chat message validation
const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  conversationId: z.string().optional(), // Optional - will create new conversation if not provided
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// POST endpoint to send a message to the chatbot
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatbotId = params.id;
    const data = await req.json();
    
    // Validate input data
    const validatedData = chatMessageSchema.parse(data);
    
    // Get the chatbot details
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        dataSources: true,
      },
    });
    
    if (!chatbot) {
      return NextResponse.json(
        { error: "Chatbot not found" },
        { status: 404 }
      );
    }
    
    // Get or create conversation
    let conversationId = validatedData.conversationId;
    
    if (!conversationId) {
      // Create a new conversation
      const userIp = req.headers.get("x-forwarded-for") || "unknown";
      const userAgent = req.headers.get("user-agent") || "unknown";
      
      const conversation = await prisma.conversation.create({
        data: {
          sessionId: `session_${Date.now()}`,
          userIp,
          device: userAgent,
          browser: userAgent,
          chatbotId,
        },
      });
      
      conversationId = conversation.id;
    }
    
    // Store the user message in the database
    const userMessage = await prisma.message.create({
      data: {
        content: validatedData.message,
        role: "user",
        chatbotId,
        conversationId,
      },
    });
    
    console.log(`Created user message with ID: ${userMessage.id}`);
    
    // Get recent conversation history for context
    const recentMessages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 10, // Get the last 10 messages
    });
    
    // Format conversation history
    const conversationHistory = recentMessages
      .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");
    
    // Process the message with LangChain
    const aiResponseContent = await processChatbotMessage(
      chatbotId,
      validatedData.message,
      conversationHistory
    );
    
    // Store the AI response in the database
    const aiResponse = await prisma.message.create({
      data: {
        content: aiResponseContent,
        role: "assistant",
        chatbotId,
        conversationId,
      },
    });
    
    return NextResponse.json({
      message: aiResponse.content,
      messageId: aiResponse.id,
      conversationId,
      timestamp: aiResponse.createdAt,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve chat history
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const chatbotId = params.id;
    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");
    
    // Check if this is a public chatbot request or admin request
    if (session?.user) {
      // Verify the user owns this chatbot (admin mode)
      const chatbot = await prisma.chatbot.findFirst({
        where: {
          id: chatbotId,
          userId: session.user.id,
        },
      });
      
      if (!chatbot) {
        return NextResponse.json(
          { error: "Chatbot not found or access denied" },
          { status: 404 }
        );
      }
    }
    
    // Build query for messages
    const whereClause: { chatbotId: string; conversationId?: string } = { chatbotId };
    
    // Add conversation filter if provided
    if (conversationId) {
      whereClause.conversationId = conversationId;
    }
    
    // Get the chat history
    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "asc",
      },
    });
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
} 