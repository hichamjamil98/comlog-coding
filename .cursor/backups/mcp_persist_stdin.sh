#!/usr/bin/env bash
# Persist one MCP dump: ./mcp_persist_stdin.sh <pageId> [query|tree|combined]
# combined (default): stdin is query+tree concat -> split via mcp_to_raw.py
# query|tree: stdin is one action JSON -> write_raw_action.py
set -euo pipefail
BACKUP="$(cd "$(dirname "$0")" && pwd)"
page_id="$1"
kind="${2:-combined}"
if [[ "$kind" == "combined" ]]; then
  python3 "$BACKUP/mcp_to_raw.py" "$page_id"
elif [[ "$kind" == "query" || "$kind" == "tree" ]]; then
  python3 "$BACKUP/write_raw_action.py" "$page_id" "$kind"
else
  echo "kind must be query, tree, or combined" >&2
  exit 1
fi
