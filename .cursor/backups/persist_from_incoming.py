#!/usr/bin/env python3
"""Persist all *.mcp files in incoming/ to raw/ via mcp_to_raw.py."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BACKUP = Path(__file__).resolve().parent
INCOMING = BACKUP / "incoming"


def main() -> None:
    INCOMING.mkdir(parents=True, exist_ok=True)
    for fp in sorted(INCOMING.glob("*.mcp")):
        page_id = fp.stem
        text = fp.read_text(encoding="utf-8")
        if not text.strip():
            print("skip empty", fp)
            continue
        p = subprocess.run(
            [sys.executable, str(BACKUP / "mcp_to_raw.py"), page_id],
            input=text,
            text=True,
            capture_output=True,
        )
        if p.returncode != 0:
            sys.stderr.write(p.stderr or "")
            raise SystemExit(p.returncode)
        if p.stdout:
            print(p.stdout, end="")
        print("persisted", page_id)
    for fp in sorted(INCOMING.glob("*.*.json")):
        name = fp.stem
        if "." not in name:
            continue
        page_id, kind = name.rsplit(".", 1)
        if kind not in ("query", "tree"):
            continue
        body = fp.read_text(encoding="utf-8")
        p = subprocess.run(
            [sys.executable, str(BACKUP / "persist_tool_stdout.py"), f"{page_id}.{kind}"],
            input=body,
            text=True,
            capture_output=True,
        )
        if p.returncode != 0:
            sys.stderr.write(p.stderr or "")
            raise SystemExit(p.returncode)
        if p.stdout:
            print(p.stdout, end="")
        print("persisted", f"{page_id}.{kind}")


if __name__ == "__main__":
    main()
