#!/usr/bin/env python3
"""Extract exam PDF pages and detect 第1〜4問 page ranges."""
from __future__ import annotations

import json
import os
import re
import shutil
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
OUT_Q = ROOT / "public" / "exam-pages"
OUT_A = ROOT / "public" / "exam-answers"
DATA = ROOT / "src" / "data" / "exams"
META_OUT = DATA / "catalog.json"

# id, title, json, question_pdf, answer_pdf|None
CATALOG = [
    {
        "id": "common-2025-hon",
        "title": "令和7年度 本試験",
        "json": "common_test_2025_hon_info1.json",
        "questionPdf": "令和7年度情報Ⅰ本試験_問題.pdf",
        "answerPdf": "令和7年度情報Ⅰ本試験_解答.pdf",
    },
    {
        "id": "common-2025-tsui",
        "title": "令和7年度 追試験",
        "json": "common_test_2025_tsui_info1.json",
        "questionPdf": "令和7年度情報Ⅰ追試験_問題.pdf",
        "answerPdf": "令和7年度情報Ⅰ追試験_解答.pdf",
    },
    {
        "id": "common-2026-hon",
        "title": "令和8年度 本試験",
        "json": "common_test_2026_hon_info1.json",
        "questionPdf": "令和8年度情報Ⅰ本試験_問題.pdf",
        "answerPdf": "令和8年度情報Ⅰ本試験_解答.pdf",
    },
    {
        "id": "common-2026-tsui",
        "title": "令和8年度 追試験",
        "json": "common_test_2026_tsui_info1.json",
        "questionPdf": "令和8年度情報Ⅰ追試験_問題.pdf",
        "answerPdf": "令和8年度情報Ⅰ追試験_解答.pdf",
    },
    {
        "id": "shisaku-2025",
        "title": "共通テスト 試作問題",
        "json": "shisaku_2025_info1.json",
        "questionPdf": "試作問題『情報Ⅰ』問題.pdf",
        "answerPdf": "試作問題『情報Ⅰ』解答.pdf",
    },
    {
        "id": "kawai-2025-1st",
        "title": "河合塾 2025 第1回",
        "json": "kawai_1st_2025_info1.json",
        "questionPdf": "2025年度 第 1 回 全統共通テスト模試問題 情報Ⅰ.pdf",
        "answerPdf": None,
    },
    {
        "id": "kawai-2025-2nd",
        "title": "河合塾 2025 第2回",
        "json": "kawai_2025_info1_2nd.json",
        "questionPdf": "2025年度 第 2 回 全統共通テスト模試問題 情報Ⅰ.pdf",
        "answerPdf": None,
    },
    {
        "id": "kawai-2025-3rd",
        "title": "河合塾 2025 第3回",
        "json": "kawai_2025_info1_3rd.json",
        "questionPdf": "2025年度 第 3 回 全統共通テスト模試問題 情報Ⅰ.pdf",
        "answerPdf": None,
    },
    {
        "id": "kawai-2025-pre",
        "title": "河合塾 2025 プレ",
        "json": "kawai_pre_2025_info1.json",
        "questionPdf": "2025年度 全統プレ共通テスト問題 情報Ⅰ.pdf",
        "answerPdf": None,
    },
    {
        "id": "kawai-2026-2nd",
        "title": "河合塾 2026 第2回",
        "json": "kawai_common_test_2026_info1_2nd.json",
        "questionPdf": "２６年度第２回共通テスト模試 情報Ⅰ.pdf",
        "answerPdf": None,
    },
    {
        "id": "shinken-2025-06",
        "title": "進研マーク 2025 6月",
        "json": "shinken_2025_06_info1.json",
        "questionPdf": "2025年度6月進研マーク模試.pdf",
        "answerPdf": None,
    },
    {
        "id": "shinken-2025-09",
        "title": "進研マーク 2025 9月",
        "json": "shinken_2025_09_info1.json",
        "questionPdf": "2025年度9月進研マーク模試.pdf",
        "answerPdf": None,
    },
    {
        "id": "shinken-2025-11",
        "title": "進研マーク 2025 11月",
        "json": "shinken_2025_11_info1.json",
        "questionPdf": "2025年度11月進研マーク模試.pdf",
        "answerPdf": None,
    },
    {
        "id": "shinken-2026-06",
        "title": "進研マーク 2026 6月",
        "json": "shinken_2026_06_info1.json",
        "questionPdf": "2026年度6月進研マーク模試.pdf",
        "answerPdf": None,
    },
]


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
    }
)


def compact_text(text: str) -> str:
    t = (text or "").translate(DIGIT_MAP)
    return re.sub(r"\s+", "", t)


def find_section_starts(doc: pymupdf.Document) -> dict[str, int]:
    """Return 1-based start page for 第1〜4問 (first strong hit)."""
    candidates: dict[str, list[int]] = {"1": [], "2": [], "3": [], "4": []}
    for i in range(len(doc)):
        compact = compact_text(doc[i].get_text("text") or "")
        page = i + 1
        for n in ("1", "2", "3", "4"):
            if re.search(rf"第{n}問次の", compact) or re.search(
                rf"第{n}問.{{0,12}}配点", compact
            ):
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


def ranges_from_starts(starts: dict[str, int], page_count: int) -> dict[str, dict]:
    ordered = [(n, starts[n]) for n in ("1", "2", "3", "4") if n in starts]
    ranges: dict[str, dict] = {}
    if len(ordered) < 4:
        content_start = starts.get("1", 1)
        usable = page_count - content_start + 1
        size = max(1, usable // 4)
        for idx, n in enumerate(("1", "2", "3", "4")):
            s = content_start + idx * size
            e = (
                page_count
                if idx == 3
                else min(page_count, content_start + (idx + 1) * size - 1)
            )
            ranges[n] = {"start": s, "end": max(s, e), "method": "equal-split"}
        return ranges

    for i, (n, s) in enumerate(ordered):
        e = (ordered[i + 1][1] - 1) if i + 1 < len(ordered) else page_count
        ranges[n] = {"start": s, "end": max(s, e), "method": "text-detect"}
    return ranges


def render_pdf(pdf_path: Path, out_dir: Path, scale: float = 1.15) -> list[str]:
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("*.png"):
        old.unlink()
    doc = pymupdf.open(pdf_path)
    urls: list[str] = []
    mat = pymupdf.Matrix(scale, scale)
    rel = out_dir.relative_to(ROOT / "public").as_posix()
    for i in range(len(doc)):
        pix = doc[i].get_pixmap(matrix=mat, alpha=False)
        name = f"p{i + 1:02d}.png"
        pix.save(out_dir / name)
        urls.append(f"/{rel}/{name}")
    doc.close()
    return urls


def main() -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    if OUT_Q.exists():
        shutil.rmtree(OUT_Q)
    if OUT_A.exists():
        shutil.rmtree(OUT_A)
    OUT_Q.mkdir(parents=True)
    OUT_A.mkdir(parents=True)

    catalog_out = []
    for item in CATALOG:
        qpdf = ROOT / item["questionPdf"]
        if not qpdf.exists():
            raise SystemExit(f"missing question pdf: {item['questionPdf']}")
        src_json = ROOT / item["json"]
        if not src_json.exists():
            raise SystemExit(f"missing json: {item['json']}")
        shutil.copy2(src_json, DATA / item["json"])

        print("rendering", item["id"], "...")
        q_urls = render_pdf(qpdf, OUT_Q / item["id"], scale=1.1)
        doc = pymupdf.open(qpdf)
        starts = find_section_starts(doc)
        ranges = ranges_from_starts(starts, len(doc))
        doc.close()

        pages = {
            n: q_urls[r["start"] - 1 : r["end"]]
            for n, r in ranges.items()
        }

        answer_urls: list[str] = []
        if item["answerPdf"]:
            apdf = ROOT / item["answerPdf"]
            if apdf.exists() and apdf.stat().st_size > 1000:
                # tiny text PDFs still render; skip empty
                answer_urls = render_pdf(apdf, OUT_A / item["id"], scale=1.2)
            else:
                print("  skip answer pdf", item["answerPdf"])

        entry = {
            "id": item["id"],
            "title": item["title"],
            "json": item["json"],
            "questionPdf": item["questionPdf"],
            "answerPdf": item["answerPdf"],
            "pageCount": len(q_urls),
            "ranges": ranges,
            "pages": pages,
            "answerPages": answer_urls,
        }
        catalog_out.append(entry)
        print(
            " ",
            item["id"],
            "pages",
            len(q_urls),
            "ranges",
            {k: (v["start"], v["end"]) for k, v in ranges.items()},
            "answers",
            len(answer_urls),
        )

    META_OUT.write_text(
        json.dumps({"sources": catalog_out}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("wrote", META_OUT)


if __name__ == "__main__":
    main()
