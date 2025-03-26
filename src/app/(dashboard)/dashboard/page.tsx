import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  MessageSquare,
  Users,
  ArrowRight,
  TrendingUp,
  Globe,
  Plus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | AI Chat CRM",
  description: "Manage your AI chatbots",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // This would come from a real database query in production
  const stats = {
    chatbots: 3,
    totalVisitors: 1458,
    totalMessages: 8924,
    totalConversions: 126,
    conversionRate: 8.64,
    popularCountries: [
      { name: "United States", count: 764 },
      { name: "United Kingdom", count: 243 },
      { name: "Germany", count: 187 },
      { name: "France", count: 112 },
      { name: "Canada", count: 92 },
    ],
  };

  // This would also come from a real database in production
  const recentChatbots = [
    {
      id: "1",
      name: "Support Bot",
      conversations: 342,
      messages: 2451,
      lastActive: "2 hours ago",
    },
    {
      id: "2",
      name: "Sales Assistant",
      conversations: 211,
      messages: 1854,
      lastActive: "5 hours ago",
    },
    {
      id: "3",
      name: "Product Guide",
      conversations: 187,
      messages: 1392,
      lastActive: "1 day ago",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name || "User"}</h1>
        <div className="flex gap-4">
          <Link href="/dashboard/chatbots/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Chatbot
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Chatbots</p>
              <h3 className="text-3xl font-bold mt-1">{stats.chatbots}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard/chatbots"
              className="text-sm text-blue-600 font-medium flex items-center"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Visitors</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalVisitors}</h3>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard/analytics"
              className="text-sm text-green-600 font-medium flex items-center"
            >
              View analytics
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Messages</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalMessages}</h3>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500 flex items-center">
              <span className="text-purple-600 font-medium">+24%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <h3 className="text-3xl font-bold mt-1">{stats.conversionRate}%</h3>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500 flex items-center">
              <span className="text-orange-600 font-medium">+2.3%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Chatbots */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Your Chatbots</h2>
            <Link href="/dashboard/chatbots">
              <Button variant="ghost" size="sm" className="text-sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentChatbots.map((bot) => (
              <div
                key={bot.id}
                className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium">{bot.name}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {bot.conversations} conversations · {bot.messages} messages
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Last active: {bot.lastActive}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visitor Locations */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Visitor Locations</h2>
            <Link href="/dashboard/analytics">
              <Button variant="ghost" size="sm" className="text-sm">
                View analytics
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {stats.popularCountries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span>{country.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">{country.count}</span>
                  <span className="text-gray-500 ml-2">visitors</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 