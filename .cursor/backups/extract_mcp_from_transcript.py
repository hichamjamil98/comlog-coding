#!/usr/bin/env python3
"""Extract data_element_tool JSON dumps from agent transcript and save to raw/."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "raw"
MARKER_TREE = '{"label":"tree"'


def split_combined(text: str) -> tuple[str | None, str | None]:
    text = text.strip()
    if MARKER_TREE in text:
        query_part, rest = text.split(MARKER_TREE, 1)
        return query_part.strip(), (MARKER_TREE + rest).strip()
    if '"label":"query"' in text and '"action":"query_elements"' in text:
        return text, None
    if '"label":"tree"' in text:
        return None, text
    return None, None


def iter_tool_texts(transcript_path: Path) -> list[str]:
    out: list[str] = []
    for line in transcript_path.read_text(encoding="utf-8").splitlines():
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if obj.get("role") != "assistant":
            continue
        for part in obj.get("message", {}).get("content", []):
            if part.get("type") != "tool_use":
                continue
            if part.get("name") != "CallDynamicTool":
                continue
            inp = part.get("input") or {}
            if inp.get("toolName") != "data_element_tool":
                continue
            # tool results appear in following tool_result messages in some formats
            pass
        # Also scan assistant text for raw JSON lines (subagent tool results inlined)
        for part in obj.get("message", {}).get("content", []):
            if part.get("type") == "text":
                t = part.get("text") or ""
                if '"action":"query_elements"' in t or '"action":"get_all_elements"' in t:
                    # strip markdown fences if any
                    t = re.sub(r"^```.*?\n", "", t)
                    t = re.sub(r"\n```$", "", t)
                    if t.strip().startswith("{"):
                        out.append(t.strip())
    return out


def page_id_from_dump(text: str) -> str | None:
    m = re.search(r'"component":"([0-9a-f]{24})"', text)
    return m.group(1) if m else None


def save_page(page_id: str, query: str | None, tree: str | None) -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    if query and tree:
        combined = RAW / f"{page_id}.json"
        combined.write_text(query + "\n\n" + tree + "\n", encoding="utf-8")
        print("combined", combined)
    elif query:
        p = RAW / f"{page_id}.query.json"
        p.write_text(query + "\n", encoding="utf-8")
        print("query", p)
    if tree and not (query and tree):
        p = RAW / f"{page_id}.tree.json"
        p.write_text(tree + "\n", encoding="utf-8")
        print("tree", p)


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: extract_mcp_from_transcript.py <transcript.jsonl> [...]")
    by_page: dict[str, dict[str, str]] = {}
    for path_str in sys.argv[1:]:
        for text in iter_tool_texts(Path(path_str)):
            q, t = split_combined(text)
            blob = q or t
            if not blob:
                continue
            pid = page_id_from_dump(blob)
            if not pid:
                continue
            slot = by_page.setdefault(pid, {})
            if q:
                slot["query"] = q
            if t:
                slot["tree"] = t
    for pid, parts in sorted(by_page.items()):
        save_page(pid, parts.get("query"), parts.get("tree"))


if __name__ == "__main__":
    main()
