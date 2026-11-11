#!/usr/bin/env python3
"""Copy newest agent-tools dump containing pageId into raw/<pageId>.json."""
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

AGENT_TOOLS = Path(
    "/Users/tarikjamil/.cursor/projects/Users-tarikjamil-Dropbox-Work-Github-comlog-coding/agent-tools"
)
RAW = Path(__file__).resolve().parent / "raw"


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: ingest_agent_tool_dump.py <pageId>")
    page_id = sys.argv[1]
    needle = f'"component":"{page_id}"'
    candidates: list[Path] = []
    for fp in AGENT_TOOLS.glob("*.txt"):
        try:
            head = fp.read_text(encoding="utf-8", errors="replace")[:8000]
        except OSError:
            continue
        if '"action":"query_elements"' not in head and '"label":"query"' not in head:
            continue
        if needle not in head:
            continue
        candidates.append(fp)
    if not candidates:
        raise SystemExit(f"no agent-tools dump found for {page_id}")
    newest = max(candidates, key=lambda p: p.stat().st_mtime)
    RAW.mkdir(parents=True, exist_ok=True)
    dest = RAW / f"{page_id}.json"
    shutil.copy2(newest, dest)
    print(dest)


if __name__ == "__main__":
    main()
