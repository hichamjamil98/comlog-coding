#!/usr/bin/env python3
"""stdin: MCP data_element_tool response text → writes normalized_cache/<pageId>.json"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from build_webflow_copy_backup import PAGES, build_page_backup

BACKUP_DIR = Path(__file__).resolve().parent
RAW_DIR = BACKUP_DIR / "raw"
CACHE_DIR = BACKUP_DIR / "normalized_cache"


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: cache_from_mcp_text.py <pageId>")
    page_id = sys.argv[1]
    meta = next((p for p in PAGES if p["pageId"] == page_id), None)
    if not meta:
        raise SystemExit(f"unknown page id {page_id}")
    text = sys.stdin.read()
    if not text.strip():
        raise SystemExit("empty stdin")
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    raw_path = RAW_DIR / f"{page_id}.json"
    raw_path.write_text(text if text.endswith("\n") else text + "\n", encoding="utf-8")
    page = build_page_backup(meta, raw_path)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    out = CACHE_DIR / f"{page_id}.json"
    out.write_text(json.dumps(page, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"raw": str(raw_path), "cache": str(out), "textNodes": page["textNodeCount"]}))


if __name__ == "__main__":
    main()
