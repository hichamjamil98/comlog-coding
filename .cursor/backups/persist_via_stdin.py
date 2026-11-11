#!/usr/bin/env python3
"""persist_via_stdin.py <pageId> <query|tree>  # pipe MCP action JSON on stdin"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: persist_via_stdin.py <pageId> <query|tree>")
    page_id, kind = sys.argv[1], sys.argv[2]
    data = sys.stdin.read()
    if not data.strip():
        raise SystemExit("empty stdin")
    subprocess.check_call(
        [sys.executable, str(ROOT / "write_mcp_action_stdin.py"), page_id, kind],
        input=data,
        text=True,
        cwd=str(ROOT),
    )


if __name__ == "__main__":
    main()
