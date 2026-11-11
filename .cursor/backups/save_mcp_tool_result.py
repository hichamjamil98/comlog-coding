#!/usr/bin/env python3
"""Write data_element_tool MCP result to raw/<pageId>.json (combined query+tree lines)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "raw"


def extract_action_objects(payload: object) -> list[dict]:
    """Normalize MCP tool response into [{label, action, result}, ...]."""
    if isinstance(payload, str):
        payload = json.loads(payload)
    out: list[dict] = []
    if isinstance(payload, dict):
        if payload.get("action") or payload.get("label") in ("query", "tree"):
            return [payload]
        for key in ("content", "result", "results", "data"):
            if key in payload:
                sub = extract_action_objects(payload[key])
                if sub:
                    return sub
        if isinstance(payload.get("result"), list):
            for item in payload["result"]:
                if isinstance(item, dict) and (item.get("action") or item.get("label")):
                    out.append(item)
            if out:
                return out
    if isinstance(payload, list):
        for item in payload:
            if isinstance(item, dict):
                if item.get("type") == "text" and item.get("text"):
                    try:
                        parsed = json.loads(item["text"])
                    except json.JSONDecodeError:
                        for line in item["text"].splitlines():
                            line = line.strip()
                            if not line.startswith("{"):
                                continue
                            try:
                                out.append(json.loads(line))
                            except json.JSONDecodeError:
                                pass
                        continue
                    out.extend(extract_action_objects(parsed))
                elif item.get("action") or item.get("label") in ("query", "tree"):
                    out.append(item)
                else:
                    out.extend(extract_action_objects(item))
    return out


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: save_mcp_tool_result.py <pageId> <mcp-json-file>")
    page_id = sys.argv[1]
    src = Path(sys.argv[2])
    payload = json.loads(src.read_text(encoding="utf-8"))
    actions = extract_action_objects(payload)
    if not actions:
        raise SystemExit(f"no query/tree objects found in {src}")
    RAW.mkdir(parents=True, exist_ok=True)
    lines: list[str] = []
    for obj in actions:
        label = obj.get("label")
        action = obj.get("action")
        if label == "query" or action == "query_elements":
            lines.append(json.dumps(obj, ensure_ascii=False))
        elif label == "tree" or action == "get_all_elements":
            lines.append(json.dumps(obj, ensure_ascii=False))
    if not lines:
        raise SystemExit("no query or tree actions in response")
    dest = RAW / f"{page_id}.json"
    dest.write_text("\n\n".join(lines) + "\n", encoding="utf-8")
    print(dest)


if __name__ == "__main__":
    main()
