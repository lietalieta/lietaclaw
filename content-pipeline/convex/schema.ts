import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  content: defineTable({
    title: v.string(),
    stage: v.union(
      v.literal("idea"),
      v.literal("research"),
      v.literal("writing"),
      v.literal("review"),
      v.literal("scheduled"),
      v.literal("published")
    ),
    idea: v.optional(v.string()),
    script: v.optional(v.string()),
    images: v.optional(v.array(v.string())), // URLs to images
    platform: v.optional(v.string()), // twitter, youtube, blog, etc.
    assignee: v.union(v.literal("user"), v.literal("assistant")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
