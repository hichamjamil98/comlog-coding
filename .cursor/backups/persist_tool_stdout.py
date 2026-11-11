#!/usr/bin/env python3
"""Persist one data_element_tool JSON line: python3 persist_tool_stdout.py < pageId.kind"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "raw"
PAGE_IDS = {
    "6a6cb755d670ca285ae247a7",
    "6a70f253a0580d8eecf3a8df",
    "6a799f16de8ea50347de4299",
    "6a76b5079e6781a886028f39",
    "6a7115eae9dabbf337810f2d",
    "6a75f97791fb55eb83075d57",
    "6a761d46ca4e2a824be8bf21",
    "6a76238d13afbbafae3426ef",
    "6a76a6d02080f00d79a0d770",
    "6a76ac1e39669d4a49e27eb7",
    "6a76b150b2ad1918e6fa9e22",
}


def page_id_from_obj(obj: dict) -> str | None:
    blob = json.dumps(obj, ensure_ascii=False)
    for pid in PAGE_IDS:
        if f'"component":"{pid}"' in blob:
            return pid
    return None


def main() -> None:
    if len(sys.argv) != 2 or "." not in sys.argv[1]:
        raise SystemExit("usage: persist_tool_stdout.py <pageId>.<query|tree>  # read JSON from stdin")
    page_id, kind = sys.argv[1].rsplit(".", 1)
    if kind not in ("query", "tree"):
        raise SystemExit("suffix must be query or tree")
    obj = json.loads(sys.stdin.read().strip())
    pid = page_id_from_obj(obj) or page_id
    RAW.mkdir(parents=True, exist_ok=True)
    out = RAW / f"{pid}.{kind}.json"
    out.write_text(json.dumps(obj, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"path": str(out), "bytes": out.stat().st_size}))


if __name__ == "__main__":
    main()
