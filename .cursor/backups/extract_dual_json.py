#!/usr/bin/env python3
"""Split concatenated query+tree MCP JSON objects into raw/<pageId>.{query,tree}.json"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from build_webflow_copy_backup import iter_json_objects

RAW = Path(__file__).resolve().parent / "raw"


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: extract_dual_json.py <pageId> <concatenated-json-file>")
    page_id = sys.argv[1]
    text = Path(sys.argv[2]).read_text(encoding="utf-8")
    RAW.mkdir(parents=True, exist_ok=True)
    for obj in iter_json_objects(text):
        label = obj.get("label")
        if label == "query":
            kind = "query"
        elif label == "tree":
            kind = "tree"
        else:
            continue
        out = RAW / f"{page_id}.{kind}.json"
        out.write_text(json.dumps(obj, ensure_ascii=False) + "\n", encoding="utf-8")
        print(out, out.stat().st_size)


if __name__ == "__main__":
    main()
