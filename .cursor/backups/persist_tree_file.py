#!/usr/bin/env python3
"""Extract get_all_elements action from MCP JSON file and write raw/<pageId>.tree.json."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from save_mcp_tool_result import extract_action_objects

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: persist_tree_file.py <pageId> <mcp-json-file>")
    page_id = sys.argv[1]
    src = Path(sys.argv[2])
    payload = json.loads(src.read_text(encoding="utf-8"))
    actions = extract_action_objects(payload)
    tree = None
    for obj in actions:
        if obj.get("label") == "tree" or obj.get("action") == "get_all_elements":
            tree = obj
            break
    if tree is None and len(actions) == 1:
        tree = actions[0]
    if tree is None:
        raise SystemExit("no tree action in file")
    RAW.mkdir(parents=True, exist_ok=True)
    out = RAW / f"{page_id}.tree.json"
    out.write_text(json.dumps(tree, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"path": str(out), "bytes": out.stat().st_size}))


if __name__ == "__main__":
    main()
