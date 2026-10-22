# -*- coding: utf-8 -*-
"""Incrementally extract the 4 newly added exams into catalog + page images."""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
OUT_Q = ROOT / "public" / "exam-pages"
OUT_A = ROOT / "public" / "exam-answers"
DATA = ROOT / "src" / "data" / "exams"
CATALOG_PATH = DATA / "catalog.json"

NEW = [
    {
        "id": "tettei-1",
        "title": "徹底演習 第1回",
        "json": "tettei_enshu_1_info1.json",
        "questionPdf": "大学入学共通テスト対策情報Ⅰ徹底演習第１回＿問題.pdf",
        "answerPdf": "大学入学共通テスト対策情報Ⅰ徹底演習第１回＿解答.pdf",
    },
    {
        "id": "tettei-2",
        "title": "徹底演習 第2回",
        "json": "tettei_enshu_2_info1.json",
        "questionPdf": "大学入学共通テスト対策情報Ⅰ徹底演習第２回＿問題.pdf",
        "answerPdf": "大学入学共通テスト対策情報Ⅰ徹底演習第２回＿解答.pdf",
    },
    {
        "id": "chokuzen-1",
        "title": "直前演習 第1回",
        "json": "chokuzen_enshu_1_info1.json",
        "questionPdf": "共通テスト対策実力完成直前演習情報Ⅰ第１回＿問題.pdf",
        "answerPdf": "共通テスト対策実力完成直前演習情報Ⅰ第１回＿解答.pdf",
    },
    {
        "id": "chokuzen-5",
        "title": "直前演習 第5回",
        "json": "chokuzen_enshu_5_info1.json",
        "questionPdf": "共通テスト対策実力完成直前演習情報Ⅰ第５回＿問題.pdf",
        "answerPdf": "共通テスト対策実力完成直前演習情報Ⅰ第５回＿解答.pdf",
    },
]

DIGIT_MAP = str.maketrans({"１": "1", "２": "2", "３": "3", "４": "4"})


def compact_text(text: str) -> str:
    t = (text or "").translate(DIGIT_MAP)
    return re.sub(r"\s+", "", t)


def find_section_starts(doc: pymupdf.Document) -> dict[str, int]:
    candidates: dict[str, list[int]] = {"1": [], "2": [], "3": [], "4": []}
    for i in range(len(doc)):
        compact = compact_text(doc[i].get_text("text") or "")
        page = i + 1
        for n in ("1", "2", "3", "4"):
            if re.search(rf"第{n}問次の", compact) or re.search(
                rf"第{n}問.{{0,24}}配点", compact
            ):
                candidates[n].append(page)
            else:
                m = re.search(rf"第{n}問", compact)
                if m and m.start() <= 40:
                    candidates[n].append(page)
    starts: dict[str, int] = {}
    last = 0
    for n in ("1", "2", "3", "4"):
        pages = [p for p in candidates[n] if p > last]
        if not pages:
            continue
        starts[n] = pages[0]
        last = pages[0]
    return starts


def equal_split_ranges(page_count: int, content_start: int = 1) -> dict[str, dict]:
    usable = page_count - content_start + 1
    size = max(1, usable // 4)
    ranges: dict[str, dict] = {}
    for idx, n in enumerate(("1", "2", "3", "4")):
        s = content_start + idx * size
        e = (
            page_count
            if idx == 3
            else min(page_count, content_start + (idx + 1) * size - 1)
        )
        ranges[n] = {"start": s, "end": max(s, e), "method": "equal-split"}
    return ranges


def ranges_from_starts(starts: dict[str, int], page_count: int) -> dict[str, dict]:
    ordered = [(n, starts[n]) for n in ("1", "2", "3", "4") if n in starts]
    if len(ordered) < 4:
        return equal_split_ranges(page_count, starts.get("1", 1))
    ranges: dict[str, dict] = {}
    for i, (n, s) in enumerate(ordered):
        e = (ordered[i + 1][1] - 1) if i + 1 < len(ordered) else page_count
        ranges[n] = {"start": s, "end": max(s, e), "method": "text-detect"}
    return ranges


def find_explanation_index(doc: pymupdf.Document) -> int | None:
    pats = ("【解説】", "設問解説", "出題のねらい", "●設問解説", "解説")
    for i in range(len(doc)):
        c = compact_text(doc[i].get_text("text") or "")
        # For image PDFs text is empty — return 1 if multi-page (page2 often expl)
        if any(p in c for p in pats) and i > 0:
            return i
    # scanned PDFs: assume page 1 is key, rest includes explanation
    if len(doc) >= 2:
        return 1
    return None


def render_pdf(pdf_path: Path, out_dir: Path, scale: float = 1.15) -> list[str]:
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
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


def ensure_placeholder_json(name: str, title: str) -> None:
    path = DATA / name
    if path.exists():
        return
    # minimal stub — will be overwritten by rebuild script
    data = {
        "metadata": {"title": title, "subject": "情報Ⅰ", "total_score": 100},
        "questions": [
            {
                "section_id": f"第{n}問",
                "section_title": f"第{n}問",
                "section_score": s,
                "sub_questions": [
                    {
                        "question_id": f"{title} 第{n}問 仮",
                        "label": "仮",
                        "mark_symbol": "ア",
                        "score": 1,
                        "context": "プレースホルダ（解答キーから再構築予定）",
                        "options": [],
                        "answer": {"correct_option": "0", "correct_index": 0},
                        "explanation": "解答・解説PDFを参照。",
                    }
                ],
            }
            for n, s in (("1", 20), ("2", 30), ("3", 25), ("4", 25))
        ],
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    root = ROOT / name
    root.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")


def main() -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    OUT_Q.mkdir(parents=True, exist_ok=True)
    OUT_A.mkdir(parents=True, exist_ok=True)
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    existing_ids = {s["id"] for s in catalog["sources"]}

    for item in NEW:
        qpdf = ROOT / item["questionPdf"]
        apdf = ROOT / item["answerPdf"]
        if not qpdf.exists():
            raise SystemExit(f"missing {qpdf}")
        if not apdf.exists():
            raise SystemExit(f"missing {apdf}")

        ensure_placeholder_json(item["json"], item["title"])
        # keep root copy in sync for rebuild scripts
        root_json = ROOT / item["json"]
        if not root_json.exists():
            shutil.copy2(DATA / item["json"], root_json)

        print("rendering Q", item["id"], "...")
        q_urls = render_pdf(qpdf, OUT_Q / item["id"], scale=1.1)
        doc = pymupdf.open(qpdf)
        starts = find_section_starts(doc)
        ranges = ranges_from_starts(starts, len(doc))
        doc.close()
        pages = {n: q_urls[r["start"] - 1 : r["end"]] for n, r in ranges.items()}

        print("rendering A", item["id"], "...")
        a_urls = render_pdf(apdf, OUT_A / item["id"], scale=1.2)
        adoc = pymupdf.open(apdf)
        expl_idx = find_explanation_index(adoc)
        adoc.close()

        # also save answer page 1 preview for vision parsing
        preview = ROOT / "scripts" / f"_preview_{item['id']}_a01.png"
        shutil.copy2(OUT_A / item["id"] / "p01.png", preview)

        entry = {
            "id": item["id"],
            "title": item["title"],
            "json": item["json"],
            "questionPdf": item["questionPdf"],
            "answerPdf": item["answerPdf"],
            "pageCount": len(q_urls),
            "ranges": ranges,
            "pages": pages,
            "answerPages": a_urls,
            "answerStartPage": None,
            "explanationStartIndex": expl_idx,
        }

        if item["id"] in existing_ids:
            catalog["sources"] = [
                entry if s["id"] == item["id"] else s for s in catalog["sources"]
            ]
        else:
            catalog["sources"].append(entry)

        print(
            " ",
            item["id"],
            "Q",
            len(q_urls),
            "A",
            len(a_urls),
            "ranges",
            {k: (v["start"], v["end"]) for k, v in ranges.items()},
            "expl",
            expl_idx,
        )

    CATALOG_PATH.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("updated", CATALOG_PATH)


if __name__ == "__main__":
    main()
