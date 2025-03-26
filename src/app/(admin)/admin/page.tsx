import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  Database,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | AI Chat CRM",
  description: "Admin dashboard for AI Chat CRM",
};

export default async function AdminDashboardPage() {
  // This would be fetched from the database in a real application
  const stats = {
    totalUsers: 142,
    totalChatbots: 315,
    totalMessages: 24689,
    recentUsers: [
      { id: "1", name: "John Doe", email: "john@example.com", createdAt: "2023-07-15T10:30:00Z" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", createdAt: "2023-07-14T14:45:00Z" },
      { id: "3", name: "Robert Johnson", email: "robert@example.com", createdAt: "2023-07-13T09:15:00Z" },
      { id: "4", name: "Emily Davis", email: "emily@example.com", createdAt: "2023-07-12T16:20:00Z" },
    ],
    systemAlerts: [
      { id: "1", message: "Gemini API quota at 85%", severity: "warning", timestamp: "2023-07-15T10:30:00Z" },
      { id: "2", message: "Database backup completed successfully", severity: "info", timestamp: "2023-07-14T02:15:00Z" },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalUsers}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/users"
              className="text-sm text-blue-600 font-medium flex items-center"
            >
              Manage users
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Chatbots</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalChatbots}</h3>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/chatbots"
              className="text-sm text-green-600 font-medium flex items-center"
            >
              View all chatbots
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">System Configuration</p>
              <h3 className="text-xl font-bold mt-1">API Keys & Settings</h3>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/systems"
              className="text-sm text-purple-600 font-medium flex items-center"
            >
              Manage configuration
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Recent Users</h2>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-medium">Name</th>
                  <th className="text-left pb-3 font-medium">Email</th>
                  <th className="text-left pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3">{user.name}</td>
                    <td className="py-3">{user.email}</td>
                    <td className="py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">System Alerts</h2>
            <Button variant="ghost" size="sm" className="text-sm">
              Clear all
            </Button>
          </div>
          <div className="space-y-4">
            {stats.systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg flex items-start ${
                  alert.severity === "warning"
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <AlertCircle
                  className={`h-5 w-5 mt-0.5 mr-3 ${
                    alert.severity === "warning" ? "text-amber-500" : "text-blue-500"
                  }`}
                />
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 