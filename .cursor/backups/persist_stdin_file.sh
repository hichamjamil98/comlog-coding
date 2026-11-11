#!/usr/bin/env bash
# usage: persist_stdin_file.sh <pageId>.<query|tree> <path-to-json-file>
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
python3 "$DIR/persist_tool_stdout.py" "$1" < "$2"
