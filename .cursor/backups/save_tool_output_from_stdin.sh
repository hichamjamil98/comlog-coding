#!/usr/bin/env bash
# usage: save_tool_output_from_stdin.sh <pageId>  (pipe combined query+tree JSON on stdin)
set -euo pipefail
PAGE_ID="${1:?pageId}"
DIR="$(cd "$(dirname "$0")" && pwd)"
python3 "$DIR/mcp_to_raw.py" "$PAGE_ID"
