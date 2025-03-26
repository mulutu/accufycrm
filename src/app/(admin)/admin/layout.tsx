import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import prisma from "@/lib/prisma";

// Components
import { Button } from "@/components/ui/button";

// Icons
import {
  Home,
  Users,
  Settings,
  Database,
  Key,
  LogOut,
  Shield,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check if user is an admin (in a real app, you'd store this in the user record)
  // For this example, we'll check if the email is admin@example.com
  if (session.user.email !== "admin@example.com") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col">
        <div className="py-4">
          <Link href="/admin" className="flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            <span className="text-xl font-bold">Admin Portal</span>
          </Link>
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          <Link
            href="/admin"
            className="flex items-center px-4 py-2 rounded-md hover:bg-slate-800"
          >
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center px-4 py-2 rounded-md hover:bg-slate-800"
          >
            <Users className="w-5 h-5 mr-3" />
            Users
          </Link>
          <Link
            href="/admin/systems"
            className="flex items-center px-4 py-2 rounded-md hover:bg-slate-800"
          >
            <Database className="w-5 h-5 mr-3" />
            System Config
          </Link>
          <Link
            href="/admin/api-keys"
            className="flex items-center px-4 py-2 rounded-md hover:bg-slate-800"
          >
            <Key className="w-5 h-5 mr-3" />
            API Keys
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center px-4 py-2 rounded-md hover:bg-slate-800"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
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
              className="w-full justify-start text-white hover:bg-slate-800"
              type="submit"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </form>
          <div className="flex items-center mt-4 pt-4 border-t border-slate-800">
            <div className="h-8 w-8 rounded-full bg-slate-700 mr-2 flex items-center justify-center">
              {session.user.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.name || "Admin"}
              </p>
              <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center px-6">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
} 