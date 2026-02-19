---
name: task-board
description: Manage a task board with tasks assigned to user or assistant. Use for tracking ongoing work.
---

# Task Board Skill

Manage tasks assigned to you or the assistant. Tasks are stored in `task-board.json` in the workspace.

## Commands

### Add a task
```
task: <title>
```
Or explicitly:
```
task: <title> [for me|for you]
```

### List tasks
```
show tasks
tasks
```

### Update task status
```
task <id> todo
task <id> in progress
task <id> done
```

### Reassign task
```
task <id> mine
task <id> yours
```

### Delete task
```
delete task <id>
```

## Implementation

The task board uses a simple JSON file at `/Users/lieta/.openclaw/workspace/task-board.json`.

Functions are in `/Users/lieta/.openclaw/workspace/task-board/lib.ts`.

To view the board visually, use the canvas:
```
show task board
```

## Task ID

Task IDs are timestamps (e.g., `1739892345000`). Use `tasks` command to see IDs.
