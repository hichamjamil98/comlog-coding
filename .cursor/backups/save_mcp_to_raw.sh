#!/usr/bin/env bash
# usage: save_mcp_to_raw.sh <pageId> <query|tree> <json-file>
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
python3 "$ROOT/persist_tool_stdout.py" "$1.$2" < "$3"
echo "saved $1.$2"
