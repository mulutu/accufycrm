import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, MoreVertical, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Chatbots | AI Chat CRM",
  description: "Manage your AI chatbots",
};

export default async function ChatbotsPage() {
  const chatbots = await prisma.chatbot.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: {
          conversations: true,
          messages: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Chatbots</h1>
        <Link href="/dashboard/chatbots/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Chatbot
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {chatbots.map((chatbot) => (
          <div
            key={chatbot.id}
            className="group relative rounded-lg border p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">{chatbot.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {chatbot.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/chatbots/${chatbot.id}`}>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/chat/${chatbot.id}`} target="_blank">
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{chatbot._count.conversations} conversations</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{chatbot._count.messages} messages</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {chatbot.logoUrl && (
                  <img
                    src={chatbot.logoUrl}
                    alt={chatbot.name}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="text-sm text-muted-foreground">
                  Last updated {new Date(chatbot.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 