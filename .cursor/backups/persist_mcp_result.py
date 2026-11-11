#!/usr/bin/env python3
"""Write MCP tool result string to incoming/<pageId>.<kind>.json and persist to raw/."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BACKUP = Path(__file__).resolve().parent
INCOMING = BACKUP / "incoming"


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: persist_mcp_result.py <pageId> <query|tree>  # read JSON from stdin")
    page_id, kind = sys.argv[1], sys.argv[2]
    data = sys.stdin.read()
    if not data.strip():
        raise SystemExit("empty stdin")
    INCOMING.mkdir(parents=True, exist_ok=True)
    inc = INCOMING / f"{page_id}.{kind}.json"
    inc.write_text(data.strip() + "\n", encoding="utf-8")
    subprocess.check_call(
        [sys.executable, str(BACKUP / "persist_tool_stdout.py"), f"{page_id}.{kind}"],
        input=data,
        text=True,
    )


if __name__ == "__main__":
    main()
