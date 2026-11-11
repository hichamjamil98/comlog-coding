#!/usr/bin/env python3
"""Append one gzip+base64 MCP tree to tree_blobs.json: add_tree_blob.py <pageId> < tree.json"""
from __future__ import annotations

import base64
import gzip
import json
import sys
from pathlib import Path

BLOBS = Path(__file__).resolve().parent / "tree_blobs.json"


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: add_tree_blob.py <pageId>  # read JSON from stdin")
    page_id = sys.argv[1]
    raw = sys.stdin.read().strip()
    if not raw:
        raise SystemExit("empty stdin")
    json.loads(raw)
    b64 = base64.b64encode(gzip.compress(raw.encode("utf-8"))).decode("ascii")
    store: dict[str, str] = {}
    if BLOBS.is_file():
        store = json.loads(BLOBS.read_text(encoding="utf-8"))
    store[page_id] = b64
    BLOBS.write_text(json.dumps(store, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"pageId": page_id, "b64_len": len(b64)}))


if __name__ == "__main__":
    main()
