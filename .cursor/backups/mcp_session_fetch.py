#!/usr/bin/env python3
"""Fetch missing query/tree via Webflow MCP (Cursor stdio) and write raw/*.query.json / *.tree.json."""
from __future__ import annotations

import json
import os
import sys
import uuid
from pathlib import Path

SITE_ID = "6a6cb753d670ca285ae24781"
SESSION_ID = "ses_3LvAndke46pIrZOo1mOnnDjgJfP"
AGENT_ID = "composer|cursor|bkup1"
BACKUP = Path(__file__).resolve().parent
RAW = BACKUP / "raw"
ACTIONS = json.loads((BACKUP / "mcp_element_actions.json").read_text(encoding="utf-8"))
QUERY_ACTION = ACTIONS[0]
TREE_ACTION = ACTIONS[1]

# Home tree: depth 2 is acceptable per backup runbook
HOME_TREE_ACTION = {"label": "tree", "get_all_elements": {"depth": 2}}

MISSING_PAGES = [
    "6a70f253a0580d8eecf3a8df",
    "6a76b5079e6781a886028f39",
    "6a7115eae9dabbf337810f2d",
    "6a75f97791fb55eb83075d57",
    "6a761d46ca4e2a824be8bf21",
    "6a76238d13afbbafae3426ef",
]


def page_needs(page_id: str, kind: str) -> bool:
    if (RAW / f"{page_id}.{kind}.json").exists():
        size = (RAW / f"{page_id}.{kind}.json").stat().st_size
        if size > 100:
            return False
    combined = RAW / f"{page_id}.json"
    if combined.exists() and combined.stat().st_size > 500:
        return False
    return True


def parse_tool_content(content: list) -> list[dict]:
    out: list[dict] = []
    for part in content:
        if not isinstance(part, dict) or part.get("type") != "text":
            continue
        text = (part.get("text") or "").strip()
        if not text:
            continue
        i = 0
        dec = json.JSONDecoder()
        while i < len(text):
            while i < len(text) and text[i].isspace():
                i += 1
            if i >= len(text):
                break
            obj, end = dec.raw_decode(text, i)
            if isinstance(obj, dict):
                out.append(obj)
            i = end
    return out


def save_obj(page_id: str, kind: str, obj: dict) -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    path = RAW / f"{page_id}.{kind}.json"
    path.write_text(json.dumps(obj, ensure_ascii=False) + "\n", encoding="utf-8")
    print("wrote", path.name, path.stat().st_size)


def main() -> None:
  try:
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client
  except ImportError:
    print("pip install mcp required", file=sys.stderr)
    raise SystemExit(1)

  repo = BACKUP.parent.parent
  mcp_json = repo / ".cursor" / "mcp.json"
  if not mcp_json.is_file():
    raise SystemExit(f"missing {mcp_json}")
  cfg = json.loads(mcp_json.read_text(encoding="utf-8"))
  srv = cfg["mcpServers"]["webflow-comlog"]
  if "url" in srv:
    print("HTTP MCP not supported here; use CallDynamicTool + persist_tool_stdout.py", file=sys.stderr)
    raise SystemExit(2)

  params = StdioServerParameters(command=srv["command"], args=srv.get("args") or [], env={**os.environ, **(srv.get("env") or {})})
  page_ids = sys.argv[1:] if len(sys.argv) > 1 else MISSING_PAGES

  async def run() -> None:
    async with stdio_client(params) as (read, write):
      async with ClientSession(read, write) as session:
        await session.initialize()
        for page_id in page_ids:
          for kind, action in (
            ("query", QUERY_ACTION),
            ("tree", HOME_TREE_ACTION if page_id == "6a6cb755d670ca285ae247a7" else TREE_ACTION),
          ):
            if not page_needs(page_id, kind):
              print("skip", page_id, kind)
              continue
            result = await session.call_tool(
              "data_element_tool",
              {
                "siteId": SITE_ID,
                "pageId": page_id,
                "session_id": SESSION_ID,
                "agent_id": AGENT_ID,
                "context": f"Automated copy backup fetch ({kind})",
                "actions": [action],
              },
            )
            objs = parse_tool_content(result.content)
            if not objs:
              print("empty", page_id, kind, file=sys.stderr)
              continue
            save_obj(page_id, kind, objs[0])

  import asyncio

  asyncio.run(run())


if __name__ == "__main__":
  main()
