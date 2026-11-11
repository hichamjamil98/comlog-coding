#!/usr/bin/env python3
"""Save MCP dump to raw/<pageId>.json from agent-tools newest match or stdin."""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

AGENT_TOOLS = Path(
    "/Users/tarikjamil/.cursor/projects/Users-tarikjamil-Dropbox-Work-Github-comlog-coding/agent-tools"
)
RAW = Path(__file__).resolve().parent / "raw"


def from_agent_tools(page_id: str) -> Path | None:
    needle = f'"component":"{page_id}"'
    candidates: list[Path] = []
    for fp in AGENT_TOOLS.glob("*.txt"):
        try:
            head = fp.read_text(encoding="utf-8", errors="replace")[:12000]
        except OSError:
            continue
        if '"label":"query"' not in head and '"action":"query_elements"' not in head:
            continue
        if needle not in head:
            continue
        candidates.append(fp)
    if not candidates:
        return None
    return max(candidates, key=lambda p: p.stat().st_mtime)


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: capture_mcp_to_raw.py <pageId> [--stdin]")
    page_id = sys.argv[1]
    RAW.mkdir(parents=True, exist_ok=True)
    dest = RAW / f"{page_id}.json"
    if "--stdin" in sys.argv:
        data = sys.stdin.read()
        if not data.strip():
            raise SystemExit("empty stdin")
        dest.write_text(data if data.endswith("\n") else data + "\n", encoding="utf-8")
        print(dest)
        return
    src = from_agent_tools(page_id)
    if not src:
        raise SystemExit(f"no agent-tools dump for {page_id}")
    shutil.copy2(src, dest)
    print(dest)


if __name__ == "__main__":
    main()
