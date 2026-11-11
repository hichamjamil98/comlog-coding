#!/usr/bin/env python3
"""Persist all incoming/<pageId>.tree.mcp.json via write_mcp_action_stdin.py."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INCOMING = ROOT / "incoming"


def main() -> None:
    files = sorted(INCOMING.glob("*.tree.mcp.json"))
    if not files:
        raise SystemExit("no incoming/*.tree.mcp.json files")
    for f in files:
        page_id = f.name.replace(".tree.mcp.json", "")
        subprocess.check_call(
            [
                sys.executable,
                str(ROOT / "write_mcp_action_stdin.py"),
                page_id,
                "tree",
            ],
            stdin=f.open(encoding="utf-8"),
            cwd=str(ROOT),
        )
    print(f"persisted {len(files)} trees")


if __name__ == "__main__":
    main()
