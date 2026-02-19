import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(), // Unix timestamp
    endTime: v.optional(v.number()),
    allDay: v.boolean(),
    recurring: v.optional(v.boolean()),
    recurrenceRule: v.optional(v.string()), // cron expression
    type: v.union(
      v.literal("task"),
      v.literal("cron"),
      v.literal("reminder"),
      v.literal("meeting"),
      v.literal("other")
    ),
    status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled")),
    assignee: v.union(v.literal("user"), v.literal("assistant"), v.literal("both")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
