import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

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
          Configure your chatbot's basic information. You can customize it and add data sources later.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Chatbot Name
              </label>
              <div className="mt-1">
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Support Assistant"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                A descriptive name to identify your chatbot.
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g., This chatbot helps customers with product inquiries and support questions."
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                A brief description of what your chatbot does.
              </p>
            </div>

            <div>
              <label
                htmlFor="primaryColor"
                className="block text-sm font-medium text-gray-700"
              >
                Primary Color
              </label>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden border">
                  <div className="w-full h-full bg-blue-600" id="colorPreview" />
                </div>
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  type="color"
                  defaultValue="#3B82F6"
                  className="h-10 w-24 p-1"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Choose a primary color for your chatbot interface.
              </p>
            </div>

            <div>
              <label
                htmlFor="welcomeMessage"
                className="block text-sm font-medium text-gray-700"
              >
                Welcome Message
              </label>
              <div className="mt-1">
                <Input
                  id="welcomeMessage"
                  name="welcomeMessage"
                  placeholder="e.g., Hi there! How can I help you today?"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                The message that appears when users first open the chat.
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Data Sources</h3>
            <p className="text-gray-600 mb-4">
              You can add data sources to train your chatbot after creation. You'll be able to upload documents, connect to websites, and more.
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/chatbots">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Create Chatbot</Button>
          </div>
        </form>
      </div>
    </div>
  );
} 