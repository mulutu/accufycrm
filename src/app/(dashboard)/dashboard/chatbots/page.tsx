import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, MoreVertical, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Chatbots | AI Chat CRM",
  description: "Manage your AI chatbots",
};

export default async function ChatbotsPage() {
  // This would come from a database query in production
  const chatbots = [
    {
      id: "1",
      name: "Support Bot",
      description: "Customer support chatbot for answering frequently asked questions.",
      lastUpdated: "2023-07-15T10:30:00Z",
      primaryColor: "#3B82F6",
      conversations: 342,
      messages: 2451,
    },
    {
      id: "2",
      name: "Sales Assistant",
      description: "Chatbot for helping potential customers with product information and pricing.",
      lastUpdated: "2023-07-10T14:22:00Z",
      primaryColor: "#10B981",
      conversations: 211,
      messages: 1854,
    },
    {
      id: "3",
      name: "Product Guide",
      description: "Helps users understand how to use your products.",
      lastUpdated: "2023-07-05T09:45:00Z",
      primaryColor: "#8B5CF6",
      conversations: 187,
      messages: 1392,
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatbots.map((chatbot) => (
          <div
            key={chatbot.id}
            className="bg-white rounded-lg border shadow-sm overflow-hidden"
          >
            <div 
              className="h-2" 
              style={{ backgroundColor: chatbot.primaryColor }}
            />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold">{chatbot.name}</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {chatbot.description}
              </p>
              
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{chatbot.conversations} conversations</span>
              </div>
              
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(chatbot.lastUpdated).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/chatbots/${chatbot.id}`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/dashboard/chatbots/${chatbot.id}/preview`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Preview
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 