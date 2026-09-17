# -*- coding: utf-8 -*-
"""Annotate catalog.json with explanationStartIndex (0-based into answerPages)."""
from __future__ import annotations

import json
import re
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src" / "data" / "exams" / "catalog.json"

EXPLAIN_PATTERNS = [
    r"【解説】",
    r"●設問解説",
    r"設問解説",
    r"出題のねらい",
    r"【設問別解説】",
]


def compact(t: str) -> str:
    return re.sub(r"\s+", "", t or "")


def find_expl_in_doc(doc: pymupdf.Document, start_1based: int = 1) -> int | None:
    for i in range(start_1based - 1, len(doc)):
        c = compact(doc[i].get_text("text") or "")
        if any(re.search(p, c) for p in EXPLAIN_PATTERNS):
            return i + 1
    return None


def main() -> None:
    cat = json.loads(CATALOG.read_text(encoding="utf-8"))
    for src in cat["sources"]:
        ap = src.get("answerPages") or []
        ans_start = src.get("answerStartPage")
        apdf = src.get("answerPdf")
        expl_pdf_page = None

        if apdf and (ROOT / apdf).exists():
            doc = pymupdf.open(ROOT / apdf)
            expl_pdf_page = find_expl_in_doc(doc, 1)
            doc.close()
            # separate answer PDF is usually key-only
            if expl_pdf_page is None:
                src["explanationStartIndex"] = None
            else:
                src["explanationStartIndex"] = expl_pdf_page - 1
        elif ans_start and src.get("questionPdf"):
            doc = pymupdf.open(ROOT / src["questionPdf"])
            expl_pdf_page = find_expl_in_doc(doc, ans_start)
            doc.close()
            if expl_pdf_page is None:
                src["explanationStartIndex"] = None
            else:
                # relative to extracted answerPages (page ans_start → index 0)
                src["explanationStartIndex"] = max(0, expl_pdf_page - ans_start)
        else:
            src["explanationStartIndex"] = None

        # clamp
        idx = src.get("explanationStartIndex")
        if idx is not None and ap and idx >= len(ap):
            src["explanationStartIndex"] = None

        print(
            src["id"],
            "ansPages",
            len(ap),
            "explIndex",
            src.get("explanationStartIndex"),
        )

    CATALOG.write_text(json.dumps(cat, ensure_ascii=False, indent=2), encoding="utf-8")
    print("updated", CATALOG)


if __name__ == "__main__":
    main()
