import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

// Components
import { Button } from "@/components/ui/button";

// Icons
import {
  Home,
  MessageSquare,
  Settings,
  BarChart3,
  HelpCircle,
  LogOut,
  User,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col">
        <div className="py-4">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">AI Chat CRM</span>
          </Link>
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center px-4 py-2 rounded-md hover:bg-slate-700"
          >
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/chatbots"
            className="flex items-center px-4 py-2 rounded-md hover:bg-slate-700"
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Chatbots
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center px-4 py-2 rounded-md hover:bg-slate-700"
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Analytics
          </Link>
          <Link
            href="/dashboard/account"
            className="flex items-center px-4 py-2 rounded-md hover:bg-slate-700"
          >
            <User className="w-5 h-5 mr-3" />
            Account
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center px-4 py-2 rounded-md hover:bg-slate-700"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
          <Link
            href="/dashboard/help"
            className="flex items-center px-4 py-2 rounded-md hover:bg-slate-700"
          >
            <HelpCircle className="w-5 h-5 mr-3" />
            Help & Support
          </Link>
        </nav>
        <div className="mt-auto pt-4">
          <form
            action={async () => {
              "use server";
              // This is where we'll handle logout
            }}
          >
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-slate-700"
              type="submit"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </form>
          <div className="flex items-center mt-4 pt-4 border-t border-slate-700">
            <div className="h-8 w-8 rounded-full bg-slate-600 mr-2 flex items-center justify-center">
              {session.user.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.name || session.user.email}
              </p>
              <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center px-6">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
} 