import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export default function middleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    return response;
  }

  // For all other requests, add CORS headers
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/api/:path*',
    '/chatbot.js',
  ],
}; 