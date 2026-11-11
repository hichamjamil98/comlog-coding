#!/usr/bin/env python3
"""Split concatenated MCP query+tree JSON from stdin into raw/<pageId>.query.json and .tree.json."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"


def load_objects(text: str) -> list[dict]:
    dec = json.JSONDecoder()
    i = 0
    n = len(text)
    out: list[dict] = []
    while i < n:
        while i < n and text[i].isspace():
            i += 1
        if i >= n:
            break
        obj, end = dec.raw_decode(text, i)
        out.append(obj)
        i = end
    return out


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: persist_mcp_stdout.py <pageId>")
    page_id = sys.argv[1]
    text = sys.stdin.read().strip()
    if not text:
        raise SystemExit("empty stdin")
    objs = load_objects(text)
    if not objs:
        raise SystemExit("no JSON objects in stdin")
    RAW.mkdir(parents=True, exist_ok=True)
    for obj in objs:
        lab = obj.get("label")
        act = obj.get("action")
        if lab == "query" or act == "query_elements":
            (RAW / f"{page_id}.query.json").write_text(
                json.dumps(obj, ensure_ascii=False) + "\n", encoding="utf-8"
            )
        elif lab == "tree" or act == "get_all_elements":
            (RAW / f"{page_id}.tree.json").write_text(
                json.dumps(obj, ensure_ascii=False) + "\n", encoding="utf-8"
            )
    print(
        json.dumps(
            {
                "pageId": page_id,
                "query": (RAW / f"{page_id}.query.json").exists(),
                "tree": (RAW / f"{page_id}.tree.json").exists(),
            }
        )
    )


if __name__ == "__main__":
    main()
