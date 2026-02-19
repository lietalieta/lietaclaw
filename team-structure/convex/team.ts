import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all members
export const getAllMembers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("members").collect();
  },
});

// Get members by role
export const getMembersByRole = query({
  args: {
    role: v.union(
      v.literal("lead"),
      v.literal("developer"),
      v.literal("writer"),
      v.literal("designer"),
      v.literal("researcher"),
      v.literal("analyst"),
      v.literal("coordinator")
    ),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("members").collect();
    return all.filter(m => m.role === args.role);
  },
});

// Get all teams
export const getAllTeams = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("teams").collect();
  },
});

// Create member
export const createMember = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("members", {
      name: args.name,
      role: args.role,
      type: args.type,
      description: args.description,
      skills: args.skills || [],
      avatar: args.avatar,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Update member
export const updateMember = mutation({
  args: {
    id: v.id("members"),
    name: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("lead"),
      v.literal("developer"),
      v.literal("writer"),
      v.literal("designer"),
      v.literal("researcher"),
      v.literal("analyst"),
      v.literal("coordinator")
    )),
    description: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("busy"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete member
export const deleteMember = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Create team
export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    members: v.array(v.id("members")),
    lead: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      members: args.members,
      lead: args.lead,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Initialize with default team structure
export const initializeTeam = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already initialized
    const existing = await ctx.db.query("members").collect();
    if (existing.length > 0) return { success: false, message: "Already initialized" };

    // Create Lietaclaw (the main AI)
    const leadId = await ctx.db.insert("members", {
      name: "Lietaclaw",
      role: "lead",
      type: "assistant",
      description: "Main AI assistant, orchestrates all subagents and manages workflows",
      skills: ["orchestration", "planning", "coordination", "communication"],
      avatar: "🦔",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Developers
    const dev1Id = await ctx.db.insert("members", {
      name: "Codex Dev",
      role: "developer",
      type: "subagent",
      description: "Handles coding tasks, bug fixes, and feature development",
      skills: ["typescript", "react", "node.js", "python", "debugging"],
      avatar: "👨‍💻",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const dev2Id = await ctx.db.insert("members", {
      name: "Claude Dev",
      role: "developer", 
      type: "subagent",
      description: "Code review, refactoring, and technical architecture",
      skills: ["code review", "architecture", "best practices", "security"],
      avatar: "🧑‍🔬",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Writers
    const writer1Id = await ctx.db.insert("members", {
      name: "Content Writer",
      role: "writer",
      type: "subagent",
      description: "Creates blog posts, social media content, and marketing copy",
      skills: ["copywriting", "seo", "social media", "storytelling"],
      avatar: "✍️",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const writer2Id = await ctx.db.insert("members", {
      name: "Tech Writer",
      role: "writer",
      type: "subagent",
      description: "Documentation, README files, and technical explanations",
      skills: ["technical writing", "documentation", "api docs", "markdown"],
      avatar: "📝",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Designers
    const designer1Id = await ctx.db.insert("members", {
      name: "UI Designer",
      role: "designer",
      type: "subagent",
      description: "User interface design, component layouts, and visual systems",
      skills: ["ui design", "tailwind", "figma", "accessibility", "responsive"],
      avatar: "🎨",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Researchers
    const researcherId = await ctx.db.insert("members", {
      name: "Researcher",
      role: "researcher",
      type: "subagent",
      description: "Web research, competitor analysis, and information gathering",
      skills: ["web search", "data analysis", "competitive analysis", "trends"],
      avatar: "🔍",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Coordinators
    const coordId = await ctx.db.insert("members", {
      name: "Project Coordinator",
      role: "coordinator",
      type: "subagent",
      description: "Manages tasks, tracks progress, and coordinates team efforts",
      skills: ["project management", "task tracking", "workflows", "scheduling"],
      avatar: "📋",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, message: "Team initialized with 8 members" };
  },
});
