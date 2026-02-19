#!/bin/bash
# Skill finder - searches for relevant skills when stuck

QUERY="$1"

if [ -z "$QUERY" ]; then
    echo "Usage: ./find-skill.sh <what you need help with>"
    exit 1
fi

cd /Users/lieta/.openclaw/workspace

# Search using qmd skill if available, otherwise grep skills
SKILL_DIR="skills"
MATCHES=""

# Search skill names and descriptions
for skill in "$SKILL_DIR"/*/SKILL.md; do
    if [ -f "$skill" ]; then
        name=$(basename "$(dirname "$skill")")
        desc=$(grep -i "^description:" "$skill" | head -1)
        
        if echo "$name $desc" | grep -qi "$QUERY"; then
            MATCHES="$MATCHES\n$name: $desc"
        fi
    fi
done

if [ -n "$MATCHES" ]; then
    echo "Found matching skills:"
    echo -e "$MATCHES"
else
    echo "No matching skills found for: $QUERY"
    echo ""
    echo "Available skills:"
    ls -1 "$SKILL_DIR"/*/SKILL.md 2>/dev/null | xargs -I{} dirname {} | xargs -I{} basename {}
fi
