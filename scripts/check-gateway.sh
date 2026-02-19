#!/bin/bash
# Check if OpenClaw gateway is running, restart if not

GATEWAY_STATUS=$(openclaw gateway status 2>/dev/null | grep -i "running\|started\|active" || echo "stopped")

if [[ "$GATEWAY_STATUS" == *"stopped"* ]] || [[ -z "$GATEWAY_STATUS" ]]; then
    echo "$(date): Gateway stopped, restarting..."
    openclaw gateway restart
else
    echo "$(date): Gateway running"
fi
