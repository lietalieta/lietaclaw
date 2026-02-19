import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all content
export const getAllContent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("content").order("desc").collect();
  },
});

// Get content by stage
export const getContentByStage = query({
  args: {
    stage: v.union(
      v.literal("idea"),
      v.literal("research"),
      v.literal("writing"),
      v.literal("review"),
      v.literal("scheduled"),
      v.literal("published")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("content").filter((q) => q.eq(q.field("stage"), args.stage)).collect();
  },
});

// Create new content
export const createContent = mutation({
  args: {
    title: v.string(),
    stage: v.optional(v.union(
      v.literal("idea"),
      v.literal("research"),
      v.literal("writing"),
      v.literal("review"),
      v.literal("scheduled"),
      v.literal("published")
    )),
    idea: v.optional(v.string()),
    script: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    platform: v.optional(v.string()),
    assignee: v.union(v.literal("user"), v.literal("assistant")),
  },
  handler: async (ctx, args) => {
    const contentId = await ctx.db.insert("content", {
      title: args.title,
      stage: args.stage || "idea",
      idea: args.idea,
      script: args.script,
      images: args.images || [],
      platform: args.platform,
      assignee: args.assignee,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return contentId;
  },
});

// Update content stage
export const updateStage = mutation({
  args: {
    id: v.id("content"),
    stage: v.union(
      v.literal("idea"),
      v.literal("research"),
      v.literal("writing"),
      v.literal("review"),
      v.literal("scheduled"),
      v.literal("published")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      stage: args.stage,
      updatedAt: Date.now(),
    });
  },
});

// Update content details
export const updateContent = mutation({
  args: {
    id: v.id("content"),
    title: v.optional(v.string()),
    idea: v.optional(v.string()),
    script: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    platform: v.optional(v.string()),
    assignee: v.optional(v.union(v.literal("user"), v.literal("assistant"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Add image to content
export const addImage = mutation({
  args: {
    id: v.id("content"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db.get(args.id);
    if (content) {
      const images = content.images || [];
      images.push(args.imageUrl);
      await ctx.db.patch(args.id, {
        images,
        updatedAt: Date.now(),
      });
    }
  },
});

// Remove image from content
export const removeImage = mutation({
  args: {
    id: v.id("content"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db.get(args.id);
    if (content) {
      const images = (content.images || []).filter((url) => url !== args.imageUrl);
      await ctx.db.patch(args.id, {
        images,
        updatedAt: Date.now(),
      });
    }
  },
});

// Delete content
export const deleteContent = mutation({
  args: {
    id: v.id("content"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
