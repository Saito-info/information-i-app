#!/usr/bin/env python3
"""Re-detect 第1〜4問 page ranges and update catalog.json (no re-render)."""
from __future__ import annotations

import json
import re
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "src" / "data" / "exams" / "catalog.json"

DIGIT_MAP = str.maketrans(
    {
        "１": "1",
        "２": "2",
        "３": "3",
        "４": "4",
        "①": "1",
        "②": "2",
        "③": "3",
        "④": "4",
        "➀": "1",
        "➁": "2",
        "➂": "3",
        "➃": "4",
    }
)

# Manual overrides when OCR/text is unreliable
MANUAL_STARTS: dict[str, dict[str, int]] = {
    # 第2問 OCR: 「第2商」
    "kawai-2026-2nd": {"1": 2, "2": 10, "3": 26, "4": 34},
    "kawai-2025-2nd": {"1": 2, "2": 12, "3": 24, "4": 32},
    "shinken-2025-11": {"1": 4, "2": 16, "3": 30, "4": 38},
}


def compact_text(text: str) -> str:
    t = (text or "").translate(DIGIT_MAP)
    return re.sub(r"\s+", "", t)


def find_section_starts(doc: pymupdf.Document) -> dict[str, int]:
    candidates: dict[str, list[int]] = {"1": [], "2": [], "3": [], "4": []}
    answer_zone = max(1, int(len(doc) * 0.75))

    for i in range(len(doc)):
        compact = compact_text(doc[i].get_text("text") or "")
        page = i + 1

        if page >= answer_zone and (
            "自己採点" in compact
            or "解答記号" in compact
            or "出題のねらい" in compact
            or (compact.count("第1問") >= 1 and compact.count("第2問") >= 1 and compact.count("第3問") >= 1)
        ):
            continue

        for n in ("1", "2", "3", "4"):
            patterns = [
                rf"第{n}問次の",
                rf"第{n}問.{{0,24}}配点",
                rf"第{n}商.{{0,24}}配点",
            ]
            matched = any(re.search(pat, compact) for pat in patterns)
            if not matched:
                m = re.search(rf"第{n}問", compact)
                if m and m.start() <= 40:
                    matched = True
            if matched:
                candidates[n].append(page)

    starts: dict[str, int] = {}
    for n in ("1", "2", "3", "4"):
        pages = candidates[n]
        if not pages:
            continue
        prev = starts.get(str(int(n) - 1)) if n != "1" else 0
        pick = next((p for p in pages if p > (prev or 0)), pages[0])
        if n != "1" and pick <= 3 and len(pages) > 1:
            pick = pages[1]
        starts[n] = pick

    ordered: dict[str, int] = {}
    last = 0
    for n in ("1", "2", "3", "4"):
        if n not in starts:
            continue
        if starts[n] <= last:
            alts = [p for p in candidates[n] if p > last]
            if not alts:
                continue
            starts[n] = alts[0]
        ordered[n] = starts[n]
        last = starts[n]
    return ordered


def ranges_from_starts(
    starts: dict[str, int], page_count: int, answer_start: int | None = None
) -> dict[str, dict]:
    end_limit = (answer_start - 1) if answer_start else page_count
    end_limit = max(1, end_limit)
    ordered = [(n, starts[n]) for n in ("1", "2", "3", "4") if n in starts]
    ranges: dict[str, dict] = {}
    if len(ordered) < 4:
        content_start = starts.get("1", 1)
        usable = end_limit - content_start + 1
        size = max(1, usable // 4)
        for idx, n in enumerate(("1", "2", "3", "4")):
            s = content_start + idx * size
            e = (
                end_limit
                if idx == 3
                else min(end_limit, content_start + (idx + 1) * size - 1)
            )
            ranges[n] = {"start": s, "end": max(s, e), "method": "equal-split"}
        return ranges

    for i, (n, s) in enumerate(ordered):
        e = (ordered[i + 1][1] - 1) if i + 1 < len(ordered) else end_limit
        ranges[n] = {"start": s, "end": max(s, min(e, end_limit)), "method": "text-detect"}
    return ranges


STRONG_ANSWER_START = [
    r"解答・採点基準",
    r"解答採点基準",
    r"正解・配点一覧",
    r"正解配点一覧",
    r"正解・配点",
    r"正答・配点",
    r"解答一覧",
    r"正解一覧",
]


def find_answer_start(doc: pymupdf.Document) -> int | None:
    n = len(doc)
    for i in range(max(0, n // 2), n):
        c = compact_text(doc[i].get_text("text") or "")
        if any(re.search(p, c) for p in STRONG_ANSWER_START):
            return i + 1
        if "自己採点" in c and ("解答記号" in c or "正解" in c):
            return i + 1
    return None


def main() -> None:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    for src in catalog["sources"]:
        pdf = ROOT / src["questionPdf"]
        if not pdf.exists():
            print("MISSING", src["id"], src["questionPdf"])
            continue
        doc = pymupdf.open(pdf)
        starts = MANUAL_STARTS.get(src["id"]) or find_section_starts(doc)
        method_note = "manual" if src["id"] in MANUAL_STARTS else None
        answer_start = find_answer_start(doc)
        ranges = ranges_from_starts(starts, len(doc), answer_start)
        if method_note:
            for r in ranges.values():
                r["method"] = method_note
        doc.close()

        all_pages = [
            f"/exam-pages/{src['id']}/p{i:02d}.png"
            for i in range(1, src["pageCount"] + 1)
        ]
        pages = {
            n: all_pages[r["start"] - 1 : r["end"]]
            for n, r in ranges.items()
        }
        src["ranges"] = ranges
        src["pages"] = pages
        if answer_start:
            src["answerStartPage"] = answer_start
        print(
            src["id"],
            "starts",
            starts,
            "answerStart",
            answer_start,
            "ranges",
            {k: (v["start"], v["end"], v["method"]) for k, v in ranges.items()},
        )

    CATALOG_PATH.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("updated", CATALOG_PATH)


if __name__ == "__main__":
    main()
