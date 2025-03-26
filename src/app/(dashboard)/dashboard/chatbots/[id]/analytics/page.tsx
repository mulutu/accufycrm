"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Users, MessageSquare, Clock, BarChart } from "lucide-react";

// Placeholder chart component - in a real app, use a charting library
function Chart({ type, data }: { type: string; data: any }) {
  return (
    <div className="h-72 border rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
      <div className="text-center p-4">
        <BarChart className="h-10 w-10 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">
          {type} Chart Placeholder
          <br />
          <span className="text-xs">(Use Chart.js, ReCharts, or Nivo in production)</span>
        </p>
      </div>
    </div>
  );
}

export default function ChatbotAnalyticsPage() {
  const params = useParams();
  const chatbotId = params.id as string;
  const [chatbot, setChatbot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    averageMessageCount: 0,
    averageResponseTime: 0,
    topQueries: [],
    geographicData: []
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch chatbot details
        const chatbotResponse = await fetch(`/api/chatbots/${chatbotId}`);
        if (chatbotResponse.ok) {
          const chatbotData = await chatbotResponse.json();
          setChatbot(chatbotData.chatbot);
        }
        
        // In a real app, fetch analytics data
        // For now, we'll use mock data
        setStats({
          totalConversations: 128,
          totalMessages: 645,
          averageMessageCount: 5.04,
          averageResponseTime: 1.2,
          topQueries: [
            { query: "Pricing information", count: 43 },
            { query: "How to get started", count: 38 },
            { query: "Support hours", count: 27 },
            { query: "Refund policy", count: 21 },
            { query: "Integration options", count: 16 }
          ],
          geographicData: [
            { country: "United States", count: 76 },
            { country: "United Kingdom", count: 23 },
            { country: "Canada", count: 15 },
            { country: "Australia", count: 8 },
            { country: "Germany", count: 6 }
          ]
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [chatbotId, dateRange]);

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Chatbot Not Found</CardTitle>
            <CardDescription>
              Sorry, we couldn't find the chatbot you're looking for.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Analytics: {chatbot.name}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
            <Button
              variant={dateRange === "7d" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDateRange("7d")}
            >
              7 Days
            </Button>
            <Button
              variant={dateRange === "30d" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDateRange("30d")}
            >
              30 Days
            </Button>
            <Button
              variant={dateRange === "90d" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDateRange("90d")}
            >
              90 Days
            </Button>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
      
      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Conversations</p>
                <h3 className="text-2xl font-bold">{stats.totalConversations}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Messages</p>
                <h3 className="text-2xl font-bold">{stats.totalMessages}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Messages/Conversation</p>
                <h3 className="text-2xl font-bold">{stats.averageMessageCount.toFixed(1)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time (s)</p>
                <h3 className="text-2xl font-bold">{stats.averageResponseTime.toFixed(1)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="conversations" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="queries">Popular Queries</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversations">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Volume</CardTitle>
              <CardDescription>
                Total conversations over time in the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart type="Line" data={{}} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <CardTitle>Top Queries</CardTitle>
              <CardDescription>
                Most common topics and questions from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart type="Bar" data={{}} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="geographic">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>
                User locations based on IP addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart type="Map" data={{}} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Performance</CardTitle>
              <CardDescription>
                Response times and user satisfaction metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart type="Mixed" data={{}} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Queries</CardTitle>
            <CardDescription>
              Most common questions and topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="text-left font-medium py-2 px-4">Query</th>
                    <th className="text-right font-medium py-2 px-4">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {stats.topQueries.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">{item.query}</td>
                      <td className="py-3 px-4 text-right font-medium">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>
              User locations by country
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="text-left font-medium py-2 px-4">Country</th>
                    <th className="text-right font-medium py-2 px-4">Conversations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {stats.geographicData.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">{item.country}</td>
                      <td className="py-3 px-4 text-right font-medium">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 