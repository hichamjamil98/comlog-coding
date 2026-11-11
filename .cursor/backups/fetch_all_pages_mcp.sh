#!/usr/bin/env bash
# Helper: after each data_element_tool call, pipe the raw JSON stdout into:
#   python3 persist_mcp_stdout.py <pageId>
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
PAGES=(
  "6a6cb755d670ca285ae247a7"
  "6a70f253a0580d8eecf3a8df"
  "6a799f16de8ea50347de4299"
  "6a76b5079e6781a886028f39"
  "6a7115eae9dabbf337810f2d"
  "6a75f97791fb55eb83075d57"
  "6a761d46ca4e2a824be8bf21"
  "6a76238d13afbbafae3426ef"
  "6a76a6d02080f00d79a0d770"
  "6a76ac1e39669d4a49e27eb7"
  "6a76b150b2ad1918e6fa9e22"
)
for id in "${PAGES[@]}"; do
  q="$DIR/raw/${id}.query.json"
  t="$DIR/raw/${id}.tree.json"
  printf '%s query=%s tree=%s\n' "$id" "$([ -f "$q" ] && echo ok || echo MISSING)" "$([ -f "$t" ] && echo ok || echo MISSING)"
done
