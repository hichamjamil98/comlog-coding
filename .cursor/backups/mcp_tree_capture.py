#!/usr/bin/env python3
"""Persist one MCP tree JSON object from a file: mcp_tree_capture.py <pageId> <json-file>"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: mcp_tree_capture.py <pageId> <json-file>")
    page_id, src = sys.argv[1], Path(sys.argv[2])
    subprocess.check_call(
        [sys.executable, str(ROOT / "write_mcp_action_stdin.py"), page_id, "tree"],
        stdin=src.open(encoding="utf-8"),
        cwd=str(ROOT),
    )


if __name__ == "__main__":
    main()
