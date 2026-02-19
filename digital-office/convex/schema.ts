import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    avatar: v.string(),
    status: v.union(v.literal("working"), v.literal("idle"), v.literal("break"), v.literal("offline")),
    currentTask: v.optional(v.string()),
    deskId: v.optional(v.number()), // desk position in office
    lastActive: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  
  desks: defineTable({
    id: v.number(),
    x: v.number(),
    y: v.number(),
    agentId: v.optional(v.id("agents")),
    computerOn: v.boolean(),
  }),
  
  activity: defineTable({
    agentId: v.id("agents"),
    action: v.string(),
    description: v.string(),
    timestamp: v.number(),
  }),
});
