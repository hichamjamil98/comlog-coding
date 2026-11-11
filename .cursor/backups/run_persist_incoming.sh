#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
mkdir -p incoming raw
shopt -s nullglob
for f in incoming/*.dual; do
  page="${f##*/}"; page="${page%.dual}"
  python3 persist_mcp_blob.py "$page" "$f"
done
for f in incoming/*.*.json; do
  base="${f##*/}"; page="${base%%.*}"; kind="${base#*.}"; kind="${kind%.json}"
  python3 persist_tool_stdout.py "${page}.${kind}" <"$f"
done
