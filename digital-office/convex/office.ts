import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all agents
export const getAllAgents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

// Get agent by role
export const getAgentsByRole = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("agents").collect();
    return all.filter(a => a.role === args.role);
  },
});

// Get all desks
export const getAllDesks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("desks").collect();
  },
});

// Get recent activity
export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("activity").collect();
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, args.limit || 20);
  },
});

// Update agent status
export const updateAgentStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(v.literal("working"), v.literal("idle"), v.literal("break"), v.literal("offline")),
    currentTask: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      currentTask: args.currentTask,
      lastActive: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Assign agent to desk
export const assignToDesk = mutation({
  args: {
    agentId: v.id("agents"),
    deskId: v.number(),
  },
  handler: async (ctx, args) => {
    // Clear previous desk assignment
    const desks = await ctx.db.query("desks").collect();
    for (const desk of desks) {
      if (desk.agentId === args.agentId) {
        await ctx.db.patch(desk._id, { agentId: undefined, computerOn: false });
      }
    }
    // Assign to new desk
    const targetDesk = desks.find(d => d.id === args.deskId);
    if (targetDesk) {
      await ctx.db.patch(targetDesk._id, { agentId: args.agentId, computerOn: true });
    }
    // Update agent
    await ctx.db.patch(args.agentId, { deskId: args.deskId, updatedAt: Date.now() });
  },
});

// Log activity
export const logActivity = mutation({
  args: {
    agentId: v.id("agents"),
    action: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activity", {
      agentId: args.agentId,
      action: args.action,
      description: args.description,
      timestamp: Date.now(),
    });
  },
});

// Initialize office with agents
export const initializeOffice = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already initialized
    const existing = await ctx.db.query("agents").collect();
    if (existing.length > 0) return { success: false };

    // Create desks (6 desks in a grid)
    for (let i = 0; i < 6; i++) {
      await ctx.db.insert("desks", {
        id: i,
        x: (i % 3) * 200 + 50,
        y: Math.floor(i / 3) * 180 + 100,
        computerOn: false,
      });
    }

    // Create agents
    const agentData = [
      { name: "Lietaclaw", role: "lead", avatar: "H", status: "working" as const },
      { name: "Codex Dev", role: "developer", avatar: "D1", status: "idle" as const },
      { name: "Claude Dev", role: "developer", avatar: "D2", status: "idle" as const },
      { name: "Content Writer", role: "writer", avatar: "W", status: "idle" as const },
      { name: "UI Designer", role: "designer", avatar: "D", status: "idle" as const },
      { name: "Researcher", role: "researcher", avatar: "R", status: "idle" as const },
    ];

    const agentIds = [];
    for (let i = 0; i < agentData.length; i++) {
      const a = agentData[i];
      const id = await ctx.db.insert("agents", {
        name: a.name,
        role: a.role,
        avatar: a.avatar,
        status: a.status,
        deskId: i,
        lastActive: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      agentIds.push(id);
    }

    // Assign agents to desks and turn on computers
    const desks = await ctx.db.query("desks").collect();
    for (let i = 0; i < agentData.length; i++) {
      const desk = desks.find(d => d.id === i);
      if (desk) {
        await ctx.db.patch(desk._id, { agentId: agentIds[i], computerOn: true });
      }
    }

    return { success: true, agents: agentIds.length };
  },
});
