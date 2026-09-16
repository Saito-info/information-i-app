# -*- coding: utf-8 -*-
"""Rebuild shisaku_2025_info1.json from official answer key (mark blanks)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "exams" / "shisaku_2025_info1.json"
ROOT_COPY = ROOT / "shisaku_2025_info1.json"

# Official answer key from 試作問題『情報Ⅰ』解答.pdf
# (field, label, mark_symbol, correct_index string or int, score)
ENTRIES = {
    "1": [
        ("問1", "ア・イ", "ア: 1, イ: 4", 2),  # 1-4 順不同 / 各1
        ("問1", "ウ", 3, 2),
        ("問2", "エ", 1, 3),
        ("問2", "オ", 1, 3),
        ("問3", "カ", 0, 2),
        ("問3", "キ", 2, 2),
        ("問3", "ク", 1, 2),
        ("問4", "ケ", 0, 1),
        ("問4", "コ・サ", "コ: 3, サ: 4", 3),  # 3-4 順不同 *1
    ],
    "2": [
        ("問1A", "ア", 3, 3),
        ("問2A", "イ", 2, 3),
        ("問3A", "ウ・エ", "ウ: 1, エ: 4", 4),  # 1-4 順不同 各2
        ("問4A", "オ・カ・キ・ク", "オ: 2, カ: 0, キ: 3, ク: 1", 5),
        ("問1B", "ケ", 8, 3),
        ("問1B", "コ", 4, 3),
        ("問1B", "サ・シ", "サ: 1, シ: 3", 3),
        ("問2B", "ス", 1, 3),
        ("問3B", "セ", 0, 3),
    ],
    "3": [
        ("問1", "ア", 6, 1),
        ("問1", "イ", 0, 1),
        ("問1", "ウ・エ", "ウ: 2, エ: 1", 3),  # 2-1 順不同 *2
        ("問2", "オ", 2, 1),
        ("問2", "カ", 3, 1),
        ("問2", "キ", 1, 1),
        ("問2", "ク", 1, 2),
        ("問2", "ケ", 0, 2),
        ("問2", "コ", 1, 2),
        ("問3", "サ", 3, 2),
        ("問3", "シ", 0, 2),
        ("問3", "ス・セ", "ス: 0, セ: 2", 3),
        ("問3", "ソ", 0, 2),
        ("問3", "タ", 1, 2),
    ],
    "4": [
        ("問1", "ア", 1, 4),
        ("問2", "イ", 2, 5),
        ("問3", "ウ", 0, 5),
        ("問4", "エ", 2, 5),
        ("問5", "オ", 2, 3),
        ("問5", "カ・キ", "カ: 1, キ: 1", 3),
    ],
}

SECTION_META = {
    "1": ("試作問題 第1問", "第1問 小問集合", 20),
    "2": ("試作問題 第2問", "第2問 情報デザイン・シミュレーション", 30),
    "3": ("試作問題 第3問", "第3問 プログラミング", 25),
    "4": ("試作問題 第4問", "第4問 データ分析", 25),
}


def make_sub(field: str, label: str, mark: str, correct, score: int, idx: int) -> dict:
    if isinstance(correct, int):
        answer = {"correct_option": str(correct), "correct_index": correct}
    else:
        answer = {"correct_option": correct, "correct_index": correct}
    return {
        "question_id": f"試作問題 第{field}問 {label} [{mark}]",
        "label": label,
        "mark_symbol": mark,
        "score": score,
        "context": (
            f"試作問題 第{field}問 {label}（解答記号 {mark}）。"
            "問題文・選択肢は問題PDFを参照し、マークで解答してください。"
        ),
        "options": [],
        "answer": answer,
        "explanation": f"正解は解答・解説PDFの第{field}問 {label}（{mark}）を参照。",
    }


def main() -> None:
    questions = []
    for field in ("1", "2", "3", "4"):
        sid, title, sec_score = SECTION_META[field]
        subs = []
        for i, (label, mark, correct, score) in enumerate(ENTRIES[field]):
            subs.append(make_sub(field, label, mark, correct, score, i))
        questions.append(
            {
                "section_id": sid,
                "section_title": title,
                "section_score": sec_score,
                "sub_questions": subs,
            }
        )

    data = {
        "metadata": {
            "title": "大学入学共通テスト 試作問題『情報Ⅰ』",
            "subject": "情報Ⅰ",
            "publisher": "大学入試センター",
            "total_score": 100,
            "time_limit_minutes": 60,
            "description": "解答記号ごとに分割したマーク採点用データ（正解は公式解答に準拠）",
        },
        "questions": questions,
    }
    text = json.dumps(data, ensure_ascii=False, indent=2)
    OUT.write_text(text, encoding="utf-8")
    ROOT_COPY.write_text(text, encoding="utf-8")
    total = sum(len(q["sub_questions"]) for q in questions)
    print(f"wrote {OUT} sections=4 subs={total}")


if __name__ == "__main__":
    main()
