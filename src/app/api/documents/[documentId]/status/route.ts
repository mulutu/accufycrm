import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  // 1. Authorization Check
  const expectedSecret = process.env.CONVEX_ACTION_SECRET;
  const receivedSecret = request.headers.get('X-Convex-Action-Secret');

  if (!expectedSecret || !receivedSecret || receivedSecret !== expectedSecret) {
    console.warn('Unauthorized status update attempt received for document', params.documentId);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get Data from Body
  let status: string;
  let details: string | undefined;
  try {
    const body = await request.json();
    status = body.status;
    details = body.details; // Optional error details
    if (!status || typeof status !== 'string') {
      throw new Error('Missing or invalid status field');
    }
    // Optional: Validate status values if needed
    // const validStatuses = ["processing", "completed", "failed"];
    // if (!validStatuses.includes(status)) {
    //   throw new Error(`Invalid status value: ${status}`);
    // }

  } catch (error: any) {
    console.error("Error parsing status update body:", error);
    return NextResponse.json({ error: 'Invalid request body', details: error.message }, { status: 400 });
  }

  // 3. Update Prisma Document
  try {
    const updatedDocument = await prisma.document.update({
      where: { id: params.documentId },
      data: {
        status: status,
        // Optionally store error details if you add a field to your Prisma schema
        // processingDetails: details,
      },
    });
    console.log(`Updated status for document ${params.documentId} to ${status}`);
    return NextResponse.json({ success: true, documentId: updatedDocument.id, status: updatedDocument.status });
  } catch (error: any) {
    console.error(`Failed to update status for document ${params.documentId}:`, error);
    // Handle specific Prisma errors like record not found
    if (error.code === 'P2025') { // Prisma code for RecordNotFound
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update document status' }, { status: 500 });
  }
}

// Add OPTIONS handler for CORS preflight requests (though likely not strictly needed for server-to-server)
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });

  // Set basic CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*'); // TODO: Restrict in production (e.g., to your Convex URL if possible)
  response.headers.set('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Convex-Action-Secret');
  response.headers.set('Access-Control-Max-Age', '86400'); // Cache preflight for 1 day

  return response;
} 