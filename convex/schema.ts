import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chunks: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_chatbot", ["chatbotId"]),
}); 