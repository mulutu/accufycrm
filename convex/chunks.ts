import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from './_generated/dataModel';
import { cosineSimilarity } from '../src/lib/utils';

export const create = mutation({
  args: {
    chatbotId: v.string(),
    content: v.string(),
    metadata: v.object({
      source: v.string(),
      type: v.union(v.literal("website"), v.literal("document")),
      url: v.optional(v.string()),
      filename: v.optional(v.string()),
      chunkIndex: v.number(),
      totalChunks: v.number(),
    }),
    embedding: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const chunkId = await ctx.db.insert("chunks", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return chunkId;
  },
});

// Helper function to calculate cosine similarity
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (norm1 * norm2);
}

export const search = query({
  args: {
    chatbotId: v.string(),
    embedding: v.array(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { chatbotId, embedding, limit = 5 } = args;
    
    // Get all chunks for the chatbot
    const chunks = await ctx.db
      .query("chunks")
      .withIndex("by_chatbot", q => q.eq("chatbotId", chatbotId))
      .collect();
    
    // Calculate similarity scores
    const chunksWithScores = chunks.map(chunk => ({
      ...chunk,
      similarity: cosineSimilarity(embedding, chunk.embedding),
    }));
    
    // Sort by similarity and take top N chunks
    return chunksWithScores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  },
}); 