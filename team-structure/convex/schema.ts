import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  members: defineTable({
    name: v.string(),
    role: v.union(
      v.literal("lead"),
      v.literal("developer"),
      v.literal("writer"),
      v.literal("designer"),
      v.literal("researcher"),
      v.literal("analyst"),
      v.literal("coordinator")
    ),
    type: v.union(v.literal("human"), v.literal("assistant"), v.literal("subagent")),
    description: v.string(),
    skills: v.optional(v.array(v.string())),
    avatar: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("busy")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  
  teams: defineTable({
    name: v.string(),
    description: v.string(),
    members: v.array(v.id("members")),
    lead: v.optional(v.id("members")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
