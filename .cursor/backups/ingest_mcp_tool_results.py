#!/usr/bin/env python3
"""
Scan agent-tools/*.txt for data_element_tool JSON (query/tree) and save to raw/.
Maps by page id (component id in dump). Keeps largest file per page+kind.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

AGENT_TOOLS = Path(
    "/Users/tarikjamil/.cursor/projects/Users-tarikjamil-Dropbox-Work-Github-comlog-coding/agent-tools"
)
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


def page_from_text(text: str) -> str | None:
    for pid in PAGE_IDS:
        if f'"component":"{pid}"' in text:
            return pid
    return None


def kind_from_obj(obj: dict) -> str | None:
    if obj.get("action") == "query_elements" or obj.get("label") == "query":
        return "query"
    if obj.get("action") == "get_all_elements" or obj.get("label") == "tree":
        return "tree"
    return None


def iter_objects(text: str):
    dec = json.JSONDecoder()
    i = 0
    n = len(text)
    while i < n:
        while i < n and text[i].isspace():
            i += 1
        if i >= n:
            break
        try:
            obj, end = dec.raw_decode(text, i)
        except json.JSONDecodeError:
            break
        yield obj
        i = end


def main() -> None:
    best: dict[tuple[str, str], tuple[int, dict]] = {}
    for fp in sorted(AGENT_TOOLS.glob("*.txt")):
        text = fp.read_text(encoding="utf-8", errors="replace")
        if '"action":"query_elements"' not in text and '"action":"get_all_elements"' not in text:
            continue
        for obj in iter_objects(text):
            kind = kind_from_obj(obj)
            if not kind:
                continue
            pid = page_from_text(json.dumps(obj, ensure_ascii=False))
            if not pid:
                continue
            size = len(json.dumps(obj, ensure_ascii=False))
            key = (pid, kind)
            if key not in best or size > best[key][0]:
                best[key] = (size, obj)
    RAW.mkdir(parents=True, exist_ok=True)
    for (pid, kind), (_, obj) in sorted(best.items()):
        out = RAW / f"{pid}.{kind}.json"
        if out.exists() and out.stat().st_size >= len(json.dumps(obj, ensure_ascii=False)) - 10:
            print("keep", out)
            continue
        out.write_text(json.dumps(obj, ensure_ascii=False) + "\n", encoding="utf-8")
        print("wrote", out, out.stat().st_size)
    missing = []
    for pid in sorted(PAGE_IDS):
        q = RAW / f"{pid}.query.json"
        t = RAW / f"{pid}.tree.json"
        c = RAW / f"{pid}.json"
        if not (c.exists() or (q.exists() and t.exists())):
            missing.append(pid)
    if missing:
        print("still missing:", " ".join(missing), file=sys.stderr)


if __name__ == "__main__":
    main()
