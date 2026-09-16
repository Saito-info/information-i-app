# -*- coding: utf-8 -*-
"""Detect embedded answer pages in question PDFs, render them, trim Q ranges."""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "src" / "data" / "exams" / "catalog.json"
OUT_A = ROOT / "public" / "exam-answers"

DIGIT_MAP = str.maketrans({"１": "1", "２": "2", "３": "3", "４": "4"})

STRONG_START = [
    r"解答・採点基準",
    r"解答採点基準",
    r"正解・配点一覧",
    r"正解配点一覧",
    r"正解・配点",
    r"正答・配点",
    r"解答一覧",
    r"正解一覧",
]


def compact_text(text: str) -> str:
    t = (text or "").translate(DIGIT_MAP)
    return re.sub(r"\s+", "", t)


def find_answer_start(doc: pymupdf.Document) -> int | None:
    """1-based page where answer key / explanation booklet starts."""
    n = len(doc)
    # Prefer strong markers in the latter half
    for i in range(max(0, n // 2), n):
        c = compact_text(doc[i].get_text("text") or "")
        if any(re.search(p, c) for p in STRONG_START):
            return i + 1
        if "自己採点" in c and ("解答記号" in c or "正解" in c):
            return i + 1
    # fallback: 【解説】 as first late hit after 55%
    for i in range(int(n * 0.55), n):
        c = compact_text(doc[i].get_text("text") or "")
        if c.startswith("【解説】") or "【解説】第1問" in c or "【解説】第１問" in c:
            return i + 1
    return None


def render_pages(doc: pymupdf.Document, start: int, out_dir: Path, scale: float = 1.2) -> list[str]:
    """Render pages start..end (1-based inclusive start to end of doc)."""
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
    urls: list[str] = []
    mat = pymupdf.Matrix(scale, scale)
    rel = out_dir.relative_to(ROOT / "public").as_posix()
    for i in range(start - 1, len(doc)):
        pix = doc[i].get_pixmap(matrix=mat, alpha=False)
        name = f"p{i - (start - 1) + 1:02d}.png"
        pix.save(out_dir / name)
        urls.append(f"/{rel}/{name}")
    return urls


def main() -> None:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    for src in catalog["sources"]:
        pdf = ROOT / src["questionPdf"]
        if not pdf.exists():
            print("MISSING", src["id"])
            continue

        doc = pymupdf.open(pdf)
        answer_start = find_answer_start(doc)
        has_separate = bool(src.get("answerPdf")) and (ROOT / src["answerPdf"]).exists()

        # Trim question ranges so 第4問 doesn't swallow answer pages
        ranges = src.get("ranges") or {}
        if answer_start and ranges:
            for n, r in ranges.items():
                if r.get("end", 0) >= answer_start:
                    r["end"] = max(r.get("start", 1), answer_start - 1)
            all_pages = [
                f"/exam-pages/{src['id']}/p{i:02d}.png"
                for i in range(1, src["pageCount"] + 1)
            ]
            src["pages"] = {
                n: all_pages[r["start"] - 1 : r["end"]]
                for n, r in ranges.items()
            }
            src["ranges"] = ranges
            src["answerStartPage"] = answer_start

        # Fill answerPages from question PDF when no separate answer PDF
        if not has_separate and answer_start:
            urls = render_pages(doc, answer_start, OUT_A / src["id"])
            src["answerPages"] = urls
            print(src["id"], "embedded answers", answer_start, "-", len(doc), "->", len(urls), "pages")
        elif has_separate:
            # keep existing answerPages from separate PDF
            print(src["id"], "separate answer PDF, trimmed Q at", answer_start)
        else:
            print(src["id"], "no answer start found")

        doc.close()

    CATALOG_PATH.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("updated", CATALOG_PATH)


if __name__ == "__main__":
    main()
