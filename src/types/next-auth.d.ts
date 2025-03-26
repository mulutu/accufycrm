declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
    company?: string | null;
    role?: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      phone?: string | null;
      company?: string | null;
      role?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone?: string | null;
    company?: string | null;
    role?: string | null;
  }
} 