#!/usr/bin/env python3
"""Pipe MCP get_all_elements JSON (stdin or file) through write_mcp_action_stdin."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: persist_tree_stdin.py <pageId> [json-file]")
    page_id = sys.argv[1]
    if len(sys.argv) > 2:
        data = Path(sys.argv[2]).read_text(encoding="utf-8")
    else:
        data = sys.stdin.read()
    if not data.strip():
        raise SystemExit("empty input")
    subprocess.check_call(
        [sys.executable, str(ROOT / "write_mcp_action_stdin.py"), page_id, "tree"],
        input=data,
        text=True,
        cwd=str(ROOT),
    )


if __name__ == "__main__":
    main()
