import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { ConvexHttpClient, ConvexVectorStore } from "@langchain/convex";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { WebBaseLoader } from "@langchain/community/document_loaders/web/web_base";
import { Document as LangchainDocument } from "@langchain/core/documents"; // Alias to avoid name clash


// --- Helper to Fetch Content ---
// IMPORTANT: This needs to be robust based on where your actual content lives.
async function getDocumentContent(sourceType: string, sourceValue: string): Promise<LangchainDocument[]> {
  console.log(`Loading content from ${sourceType}: ${sourceValue.substring(0, 100)}...`);
  try {
    if (sourceType === 'url') {
      const loader = new WebBaseLoader(sourceValue);
      const docs = await loader.load();
      console.log(`Loaded ${docs.length} documents from URL.`);
      // Add source metadata here if loader doesn't do it
       docs.forEach((doc: LangchainDocument) => {
           if (!doc.metadata.source) {
               doc.metadata.source = sourceValue;
           }
       });
      return docs;
    }
    if (sourceType === 'text') {
      console.log("Loaded content directly from text.");
      return [new LangchainDocument({ pageContent: sourceValue, metadata: { source: 'text_input' } })];
    }
    if (sourceType === 'file') {
      // *** CRITICAL IMPLEMENTATION NEEDED HERE ***
      // Assuming sourceValue is a publicly accessible URL for now
      console.warn("Attempting to load file content via public URL. Ensure this is secure and correct.");
      const response = await fetch(sourceValue);
      if (!response.ok) throw new Error(`Failed to fetch file URL: ${response.statusText}`);
      // Basic text handling; might need more complex parsing (PDF, DOCX) later
      const text = await response.text();
      console.log(`Loaded ${text.length} characters from file URL.`);
      return [new LangchainDocument({ pageContent: text, metadata: { source: sourceValue } })];

      // If using Convex file storage, the logic would be different:
      // const blob = await ctx.storage.get(sourceValue as Id<"_storage">); // Assuming sourceValue is the storageId
      // if (!blob) throw new Error("File blob not found in Convex storage.");
      // const text = await blob.text();
      // return [new LangchainDocument({ pageContent: text, metadata: { source: `convex_storage://${sourceValue}` } })];
    }
    console.error(`Unsupported source type: ${sourceType}`);
    return [];
  } catch (error) {
     console.error(`Error loading document content (${sourceType} - ${sourceValue.substring(0,100)}...):`, error);
     throw error; // Re-throw to be caught by the action handler
  }
}

// --- Action to Process Document ---
export const processDocument = action({
  args: {
    mysqlDocumentId: v.string(),
    chatbotId: v.string(),
    sourceType: v.union(v.literal("file"), v.literal("url"), v.literal("text")),
    sourceValue: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`Processing document chunks for mysqlDoc ${args.mysqlDocumentId}, chatbot ${args.chatbotId}, source: ${args.sourceValue.substring(0,100)}...`);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Action Error: GEMINI_API_KEY environment variable not set in Convex deployment.");
      // Should we update status to failed here? Might depend on your retry logic.
      throw new Error("Server configuration error: Missing GEMINI_API_KEY.");
    }

    const nextjsApiUrl = process.env.NEXTJS_APP_URL;
    const actionSecret = process.env.CONVEX_ACTION_SECRET;

    if (!nextjsApiUrl || !actionSecret) {
       console.error("Action Error: NEXTJS_APP_URL or CONVEX_ACTION_SECRET not set in Convex env vars. Cannot update MySQL status.");
       // Continue processing but log prominently? Or fail? Let's fail for now.
       throw new Error("Server configuration error: Missing status update URL or secret.");
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: apiKey,
    });

    const vectorStore = new ConvexVectorStore(embeddings, { ctx }); // Pass Convex context

    const updateStatus = async (status: string, details?: string) => {
      try {
        const updateUrl = `${nextjsApiUrl}/api/documents/${args.mysqlDocumentId}/status`;
        console.log(`Updating document ${args.mysqlDocumentId} status to ${status} via ${updateUrl}`);
        // Using ConvexHttpClient for making HTTP requests from Actions
        await ConvexHttpClient.request(updateUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Convex-Action-Secret': actionSecret,
          },
          body: JSON.stringify({ status, details }),
        });
      } catch (e) {
         console.error(`Failed to update document ${args.mysqlDocumentId} status to ${status}:`, e);
         // Log error but don't necessarily stop processing if it's just a status update failure
      }
    };

    try {
      await updateStatus("processing");

      // 1. Load Content
      const docs = await getDocumentContent(args.sourceType, args.sourceValue);
      if (!docs || docs.length === 0) {
        throw new Error(`Could not load any content for source: ${args.sourceValue.substring(0,100)}`);
      }

      // 2. Split into Chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 150,
      });
      const chunks = await splitter.splitDocuments(docs);
       console.log(`Document ${args.mysqlDocumentId}: Split into ${chunks.length} chunks.`);

      if (chunks.length === 0) {
        console.warn(`Document ${args.mysqlDocumentId}: No chunks generated after splitting.`);
        await updateStatus("failed", "No content chunks generated after splitting.");
        return; // Stop processing if no chunks
      }

      // 3. Add metadata and Prepare for Vector Store
      const chunksWithMetadata = chunks.map(chunk => ({
        pageContent: chunk.pageContent, // Ensure only pageContent is passed if using LCEL chains later
        metadata: {
          ...chunk.metadata, // Keep original metadata like source if available
          chatbotId: args.chatbotId,
          mysqlDocumentId: args.mysqlDocumentId,
          // Ensure source is captured if not set by loader
          source: chunk.metadata.source || args.sourceValue.substring(0, 100) || args.sourceType,
        }
      }));

      // 4. Generate Embeddings and Store in Convex
      // Adding documents one by one might be slower but potentially more resilient to timeouts
      // or large payload issues compared to addDocuments for very large numbers of chunks.
      // Consider batching logic for production.
      console.log(`Document ${args.mysqlDocumentId}: Adding ${chunksWithMetadata.length} chunks to Convex vector store...`);
      let addedCount = 0;
      for (const chunk of chunksWithMetadata) {
        try {
           await vectorStore.addDocuments([chunk]); // Add one document at a time
           addedCount++;
        } catch(addError) {
            console.error(`Failed to add chunk to vector store for mysqlDoc ${args.mysqlDocumentId}:`, addError, 'Chunk content:', chunk.pageContent.substring(0,100));
            // Decide whether to continue or fail the whole job
        }
      }
       console.log(`Document ${args.mysqlDocumentId}: Successfully added ${addedCount}/${chunksWithMetadata.length} chunks.`);

      if (addedCount === chunksWithMetadata.length) {
          await updateStatus("completed");
      } else {
          // Mark as failed if not all chunks were added
          await updateStatus("failed", `Failed to add all chunks. Added ${addedCount}/${chunksWithMetadata.length}.`);
      }


    } catch (error: any) {
      console.error(`Error processing document ${args.mysqlDocumentId}:`, error);
      await updateStatus("failed", error.message || "Unknown error during processing");
      // Optionally re-throw if you want the action run to be marked as failed in Convex logs
      // throw error;
    }
  },
});


// --- Mutation to Schedule the Action ---
export const scheduleDocumentProcessing = mutation({
  args: {
    mysqlDocumentId: v.string(),
    chatbotId: v.string(),
    sourceType: v.union(v.literal("file"), v.literal("url"), v.literal("text")),
    sourceValue: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`Mutation: Scheduling processing for document: ${args.mysqlDocumentId}`);
    // Check if already scheduled/processing? Could query the DB or rely on idempotency.

    await ctx.scheduler.runAfter(0, api.documents.processDocument, {
      mysqlDocumentId: args.mysqlDocumentId,
      chatbotId: args.chatbotId,
      sourceType: args.sourceType,
      sourceValue: args.sourceValue,
    });
    console.log(`Mutation: Successfully scheduled processing action for document: ${args.mysqlDocumentId}`);
    // Return the Convex task ID? The scheduler doesn't directly return an ID accessible here.
  },
}); 