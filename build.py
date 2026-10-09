#!/usr/bin/env python3
"""Build both standalone language pages using only the Python standard library."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def script_json(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")


def main():
    template = (ROOT / "templates/page.html").read_text(encoding="utf-8")
    data = json.loads((ROOT / "results.json").read_text(encoding="utf-8"))
    locales = json.loads((ROOT / "locales.json").read_text(encoding="utf-8"))
    output = ROOT / "dist"
    output.mkdir(exist_ok=True)
    for lang, filename in (("en", "index.html"), ("zh-CN", "zh.html")):
        copy = locales[lang]["page"]
        attributes = {"en_current": 'aria-current="page"' if lang == "en" else "",
                      "zh_current": 'aria-current="page"' if lang == "zh-CN" else ""}

        def substitute(match):
            key = match.group(1)
            return attributes[key] if key in attributes else html.escape(copy[key], quote=True)

        page = re.sub(r"\{\{(\w+)\}\}", substitute, template)
        page = page.replace("@@DATA@@", script_json(data)).replace("@@UI@@", script_json(locales[lang]["ui"]))
        if re.search(r"\{\{\w+\}\}|@@(?:DATA|UI)@@", page):
            raise ValueError(f"Unresolved placeholder in {filename}")
        (output / filename).write_text(page, encoding="utf-8")
        print(f"Built dist/{filename}")
    (output / ".nojekyll").write_text("", encoding="utf-8")


if __name__ == "__main__":
    main()
