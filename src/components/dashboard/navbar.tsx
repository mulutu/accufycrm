'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-sm font-medium"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
} 