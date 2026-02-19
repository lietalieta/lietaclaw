import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  memories: defineTable({
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    source: v.optional(v.string()), // "MEMORY.md", "memory/YYYY-MM-DD.md", etc.
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
