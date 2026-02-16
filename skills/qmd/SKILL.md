---
name: qmd
description: Local hybrid search for markdown notes and docs. Use when searching notes, finding related content, or retrieving documents from indexed collections.
metadata: {"clawdbot":{"emoji":"🔍","os":["darwin","linux"],"requires":{"bins":["qmd"]},"install":[{"id":"bun-qmd","kind":"shell","command":"bun install -g https://github.com/tobi/qmd","bins":["qmd"],"label":"Install qmd via Bun"}]}}
---

# qmd - Quick Markdown Search

Local search engine for Markdown notes, docs, and knowledge bases. Index once, search fast.

## When to use (trigger phrases)
- "search my notes / docs / knowledge base"
- "find related notes"
- "retrieve a markdown document from my collection"
- "search local markdown files"

## Prerequisites
- Bun >= 1.0.0
- macOS: `brew install sqlite` (SQLite extensions)
- Ensure PATH includes: `$HOME/.bun/bin`

## Setup
```bash
# Install bun first if needed
curl -fsSL https://bun.sh/install | bash

# Install qmd
bun install -g qmd

# Add to PATH (add to ~/.zshrc)
export PATH="$HOME/.bun/bin:$PATH"

# Index your workspace notes
qmd collection add ~/.openclaw/workspace --name workspace --mask "**/*.md"
```

## Search modes
- `qmd search` (default): fast keyword match (BM25)
- `qmd vsearch` (last resort): semantic similarity (vector). Often slow due to local LLM work before the vector lookup.
- `qmd query` (generally skip): hybrid search + LLM reranking. Often slower than `vsearch` and may timeout.

## Performance notes
- `qmd search` is typically instant.
- `qmd vsearch` can be ~1 minute on some machines because query expansion may load a local model into memory per run.

## Common commands
```bash
qmd search "query"                    # default keyword search
qmd vsearch "query"                    # semantic search (slower)
qmd search "query" -c notes            # Search specific collection
qmd search "query" -n 10               # More results
qmd search "query" --json              # JSON output
qmd get "path/to/file.md"             # Full document
qmd status                            # Index health
qmd update                           # Re-index changed files
```

## Index your workspace notes
```bash
export PATH="$HOME/.bun/bin:$PATH"
qmd collection add ~/.openclaw/workspace --name workspace --mask "**/*.md"
qmd search "your search query"
```
