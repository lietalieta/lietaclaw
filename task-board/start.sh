#!/bin/bash
# Start Task Board alongside OpenClaw Gateway

echo "Starting Task Board on port 3110..."

cd "$(dirname "$0")"

# Check if Convex is configured
if [ -z "$NEXT_PUBLIC_CONVEX_URL" ]; then
    echo "⚠️  Convex not configured yet."
    echo "Please run: cd task-board && npx convex login"
    echo "Then run: npx convex dev"
    echo ""
    echo "Starting anyway (will show errors until Convex is set up)..."
fi

# Start the Next.js app
npm run dev
