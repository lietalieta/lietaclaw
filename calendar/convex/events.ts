import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all events
export const getAllEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").order("asc").collect();
  },
});

// Get events for a specific month
export const getEventsByMonth = query({
  args: {
    year: v.number(),
    month: v.number(), // 0-11
  },
  handler: async (ctx, args) => {
    const startOfMonth = new Date(args.year, args.month, 1).getTime();
    const endOfMonth = new Date(args.year, args.month + 1, 1).getTime();
    
    const allEvents = await ctx.db.query("events").collect();
    return allEvents.filter(e => 
      (e.startTime >= startOfMonth && e.startTime < endOfMonth) ||
      (e.endTime && e.endTime >= startOfMonth && e.endTime < endOfMonth)
    );
  },
});

// Get upcoming events
export const getUpcomingEvents = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const future = now + (args.days || 7) * 24 * 60 * 60 * 1000;
    
    const allEvents = await ctx.db.query("events").collect();
    return allEvents.filter(e => 
      e.startTime >= now && e.startTime <= future
    ).sort((a, b) => a.startTime - b.startTime);
  },
});

// Create event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    recurring: v.optional(v.boolean()),
    recurrenceRule: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("task"),
      v.literal("cron"),
      v.literal("reminder"),
      v.literal("meeting"),
      v.literal("other")
    )),
    status: v.optional(v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled"))),
    assignee: v.optional(v.union(v.literal("user"), v.literal("assistant"), v.literal("both"))),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      allDay: args.allDay || false,
      recurring: args.recurring || false,
      recurrenceRule: args.recurrenceRule,
      type: args.type || "other",
      status: args.status || "scheduled",
      assignee: args.assignee || "both",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return eventId;
  },
});

// Update event
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled"))),
    assignee: v.optional(v.union(v.literal("user"), v.literal("assistant"), v.literal("both"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete event
export const deleteEvent = mutation({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Mark event as completed
export const completeEvent = mutation({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "completed",
      updatedAt: Date.now(),
    });
  },
});
