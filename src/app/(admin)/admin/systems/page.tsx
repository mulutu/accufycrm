import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Database, MailCheck, Key } from "lucide-react";

export const metadata: Metadata = {
  title: "System Configuration | AI Chat CRM",
  description: "Manage system configuration settings",
};

export default async function SystemConfigPage() {
  // This would be fetched from the database in a real application
  const configurations = [
    {
      id: "1",
      key: "GEMINI_API_KEY",
      description: "API key for Gemini AI",
      type: "api_key",
      value: "********************",
      updatedAt: "2023-07-15T10:30:00Z",
    },
    {
      id: "2",
      key: "DATABASE_URL",
      description: "Database connection string",
      type: "url",
      value: "mysql://root:*****@localhost:3306/ai_chat_crm",
      updatedAt: "2023-07-14T14:45:00Z",
    },
    {
      id: "3",
      key: "SMTP_SERVER",
      description: "Email server for sending notifications",
      type: "text",
      value: "smtp.example.com",
      updatedAt: "2023-07-13T09:15:00Z",
    },
    {
      id: "4",
      key: "SMTP_USER",
      description: "Email server username",
      type: "text",
      value: "notifications@example.com",
      updatedAt: "2023-07-13T09:15:00Z",
    },
    {
      id: "5",
      key: "SMTP_PASSWORD",
      description: "Email server password",
      type: "password",
      value: "***********",
      updatedAt: "2023-07-13T09:15:00Z",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "api_key":
        return <Key className="h-5 w-5 text-amber-500" />;
      case "url":
        return <Database className="h-5 w-5 text-blue-500" />;
      case "text":
      case "password":
        return <MailCheck className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Configuration</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Configuration
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6">
          <p className="text-gray-600">
            Manage system-wide configuration variables. These settings control various aspects of the application including API integrations, email notifications, and more.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Key</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Description</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Value</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Last Updated</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {configurations.map((config) => (
                <tr key={config.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{config.key}</td>
                  <td className="px-6 py-4">{config.description}</td>
                  <td className="px-6 py-4 font-mono">{config.value}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getIcon(config.type)}
                      <span className="capitalize">{config.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(config.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New Configuration</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="key"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Key
              </label>
              <Input
                id="key"
                name="key"
                placeholder="e.g., API_KEY_NAME"
                required
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type
              </label>
              <select
                id="type"
                name="type"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="api_key">API Key</option>
                <option value="url">URL</option>
                <option value="text">Text</option>
                <option value="password">Password</option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <Input
              id="description"
              name="description"
              placeholder="Brief description of this configuration"
              required
            />
          </div>
          <div>
            <label
              htmlFor="value"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Value
            </label>
            <Input
              id="value"
              name="value"
              placeholder="Configuration value"
              required
            />
          </div>
          <div>
            <Button type="submit">Save Configuration</Button>
          </div>
        </form>
      </div>
    </div>
  );
} 