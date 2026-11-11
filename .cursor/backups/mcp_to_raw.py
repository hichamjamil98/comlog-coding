#!/usr/bin/env python3
"""Persist data_element_tool dual JSON (query+tree) from file or stdin to raw/."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BACKUP = Path(__file__).resolve().parent
MARKER = '{"label":"tree"'


def normalize_concat(text: str) -> str:
    text = text.strip()
    if MARKER in text and f"\n\n{MARKER}" not in text:
        idx = text.index(MARKER)
        text = text[:idx].strip() + "\n\n" + text[idx:].strip()
    return text + "\n"


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: mcp_to_raw.py <pageId> [source-file]")
    page_id = sys.argv[1]
    if len(sys.argv) >= 3:
        text = Path(sys.argv[2]).read_text(encoding="utf-8")
    else:
        text = sys.stdin.read()
    if not text.strip():
        raise SystemExit("empty input")
    text = normalize_concat(text)
    proc = subprocess.run(
        [sys.executable, str(BACKUP / "split_mcp_dump.py"), page_id],
        input=text,
        text=True,
        capture_output=True,
        check=True,
    )
    if proc.stdout:
        print(proc.stdout, end="")


if __name__ == "__main__":
    main()
