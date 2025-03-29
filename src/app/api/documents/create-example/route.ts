import { NextResponse } from 'next/server';
import { ConvexClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api'; // Adjust path relative to your project root
import prisma from '@/lib/prisma';

// EXAMPLE ROUTE - Integrate this logic into your actual document creation endpoint

export async function POST(request: Request) {
    let newDocument;
    try {
        // --- 1. Get data from request body --- 
        // Adjust this based on how you receive document info (form data, JSON, etc.)
        const { name, sourceType, sourceValue, chatbotId, userId } = await request.json(); 

        // Basic validation
        if (!name || !sourceType || !sourceValue || !chatbotId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        // Validate sourceType if needed
        const validSourceTypes = ["url", "file", "text"];
        if (!validSourceTypes.includes(sourceType)) {
             return NextResponse.json({ error: `Invalid sourceType: ${sourceType}` }, { status: 400 });
        }

        // --- 2. Save initial record to MySQL via Prisma --- 
        console.log(`Creating document '${name}' in Prisma for chatbot ${chatbotId}`);
        newDocument = await prisma.document.create({
            data: {
                name,
                sourceType, 
                sourceValue, 
                chatbotId,
                userId,
                status: "pending", // Initial status
                // Assuming 'content' is optional or handled later
                content: sourceType === 'text' ? sourceValue : '', 
            },
        });
        console.log(`Document ${newDocument.id} created in Prisma.`);

        // --- 3. Trigger Convex Action via Mutation --- 
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!convexUrl) {
            console.error("Error: NEXT_PUBLIC_CONVEX_URL is not set. Cannot schedule Convex job.");
            // Depending on requirements, you might want to update the status to 'scheduling_failed' here
            // For now, just log the error but return success for the Prisma creation part.
            return NextResponse.json(newDocument, { status: 201 }); // Return success despite scheduling failure
        }

        console.log(`Scheduling Convex processing for document ${newDocument.id} using URL: ${convexUrl}`);
        const convex = new ConvexClient(convexUrl);
        await convex.mutation(api.documents.scheduleDocumentProcessing, {
            mysqlDocumentId: newDocument.id, 
            chatbotId: newDocument.chatbotId,
            // Ensure sourceType and sourceValue are correctly passed
            sourceType: newDocument.sourceType as "url" | "file" | "text", // Type assertion might be needed
            sourceValue: newDocument.sourceValue ?? '', // Handle potential null
        });
        console.log(`Successfully scheduled Convex processing for document ${newDocument.id}`);

        // --- 4. Return Response --- 
        // Return the newly created document record (or just a success message)
        return NextResponse.json(newDocument, { status: 201 });

    } catch (error: any) {
        console.error("Error in document creation endpoint:", error);
        
        // Attempt to update status to failed if Prisma creation succeeded but Convex failed
        if (newDocument?.id) {
             try {
                 await prisma.document.update({ 
                     where: { id: newDocument.id }, 
                     data: { status: 'creation_failed' } 
                 });
             } catch (updateError) {
                 console.error(`Failed to update document ${newDocument.id} status after creation error:`, updateError);
             }
        }

        // Return a generic error response
        return NextResponse.json({ error: 'Failed to create document', details: error.message }, { status: 500 });
    }
} 