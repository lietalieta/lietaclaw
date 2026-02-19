import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all memories
export const getAllMemories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("memories").order("desc").collect();
  },
});

// Search memories
export const searchMemories = query({
  args: {
    search: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.search.trim()) {
      return await ctx.db.query("memories").order("desc").collect();
    }
    const allMemories = await ctx.db.query("memories").collect();
    const searchLower = args.search.toLowerCase();
    return allMemories.filter(m => 
      m.title.toLowerCase().includes(searchLower) ||
      m.content.toLowerCase().includes(searchLower) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(searchLower)))
    );
  },
});

// Get memories by category
export const getMemoriesByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const allMemories = await ctx.db.query("memories").collect();
    return allMemories.filter(m => m.category === args.category);
  },
});

// Create memory
export const createMemory = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const memoryId = await ctx.db.insert("memories", {
      title: args.title,
      content: args.content,
      category: args.category,
      tags: args.tags || [],
      source: args.source,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return memoryId;
  },
});

// Update memory
export const updateMemory = mutation({
  args: {
    id: v.id("memories"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete memory
export const deleteMemory = mutation({
  args: {
    id: v.id("memories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Import all memories from workspace
export const importFromWorkspace = mutation({
  args: {},
  handler: async (ctx) => {
    // This will be called to import from MEMORY.md and memory folder
    // The actual import logic will be handled client-side
    return { success: true };
  },
});
