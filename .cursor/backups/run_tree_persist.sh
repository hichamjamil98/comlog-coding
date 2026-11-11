#!/usr/bin/env bash
# usage: run_tree_persist.sh <pageId>  # reads one tree JSON object from stdin
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
python3 "$DIR/persist_json_stdin.py" "$1" tree
