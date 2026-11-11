#!/usr/bin/env python3
"""Re-fetch trees for pages missing or shallow raw/*.tree.json via MCP HTTP (if authed)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

# When HTTP MCP is unavailable, print page ids still needing trees for manual MCP persist.
BACKUP = Path(__file__).resolve().parent
RAW = BACKUP / "raw"
MIN_TREE_BYTES = 8000
PAGES = [
    "6a6cb755d670ca285ae247a7",
    "6a70f253a0580d8eecf3a8df",
    "6a76b5079e6781a886028f39",
    "6a7115eae9dabbf337810f2d",
    "6a75f97791fb55eb83075d57",
    "6a761d46ca4e2a824be8bf21",
    "6a76238d13afbbafae3426ef",
    "6a76ac1e39669d4a49e27eb7",
]


def needs_tree(page_id: str) -> bool:
    path = RAW / f"{page_id}.tree.json"
    if not path.is_file():
        return True
    return path.stat().st_size < MIN_TREE_BYTES


def main() -> None:
    missing = [p for p in PAGES if needs_tree(p)]
    if not missing:
        print("all trees present")
        return
    try:
        from mcp_http_fetch import mcp_call, save_obj, TREE_ACTION
    except Exception as e:
        print("need CallDynamicTool persist for:", " ".join(missing), file=sys.stderr)
        raise SystemExit(2) from e
    for page_id in missing:
        objs = mcp_call(page_id, [TREE_ACTION])
        if objs:
            save_obj(page_id, "tree", objs[0])


if __name__ == "__main__":
    main()
