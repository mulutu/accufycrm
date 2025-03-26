import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ChatbotForm } from "@/components/dashboard/chatbot-form";

export const metadata: Metadata = {
  title: "Create New Chatbot | AI Chat CRM",
  description: "Create a new AI chatbot",
};

export default function NewChatbotPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/chatbots"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Chatbots
        </Link>
        <h1 className="text-2xl font-bold">Create New Chatbot</h1>
        <p className="mt-1 text-gray-600">
          Configure your chatbot's basic information and upload documents to train it.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <ChatbotForm />
      </div>
    </div>
  );
} 