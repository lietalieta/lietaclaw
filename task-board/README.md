# Task Board

A Next.js + Convex task tracking app for you and your AI assistant.

## Quick Start

### One-time Setup (requires login)

```bash
cd /Users/lieta/.openclaw/workspace/task-board

# Login to Convex (one-time)
npx convex login

# Initialize project (creates cloud DB)
npx convex dev
```

This will create a Convex project and set up the database.

### Running

The task board runs on **port 3110** and is managed by the gateway watchdog.

**Manual start:**
```bash
cd /Users/lieta/.openclaw/workspace/task-board
npm run dev
```

**Access at:** http://localhost:3110

### With Gateway

The gateway watchdog (`/Users/lieta/.openclaw/scripts/gateway-watchdog.sh`) automatically:
- Restarts the gateway if it crashes
- Starts the task board if it's not running

## Features

- 📋 **Three columns:** To Do, In Progress, Done
- 👤 **Assignee tracking:** "Me" (user) or "Assistant" (AI)
- 🔄 **Real-time sync** via Convex
- 🎨 **Clean UI** with Tailwind CSS

## Integration

- Port: 3110 (not 3000 to avoid conflicts)
- Auto-starts with gateway watchdog
- Data stored in Convex cloud database

## Tech Stack

- Next.js 14 (App Router)
- Convex (real-time database)
- Tailwind CSS
- TypeScript
