#!/usr/bin/env bash
# Persist all incoming/<pageId>.tree.mcp.json via write_mcp_action_stdin.py
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
shopt -s nullglob
files=("$DIR/incoming/"*.tree.mcp.json)
if ((${#files[@]} == 0)); then
  echo "no incoming/*.tree.mcp.json" >&2
  exit 1
fi
for f in "${files[@]}"; do
  page_id="$(basename "$f" .tree.mcp.json)"
  python3 "$DIR/write_mcp_action_stdin.py" "$page_id" tree < "$f"
done
echo "persisted ${#files[@]} trees"
