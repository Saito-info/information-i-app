# -*- coding: utf-8 -*-
"""Rebuild incomplete mock exam JSON from official answer keys."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "exams"

# Each entry: (label, mark_symbol, correct_index int|str, score)
# correct_index may be "ア: 1, イ: 2" for multi-blank rows.


def write_exam(
    json_name: str,
    title: str,
    sections: dict[str, list[tuple[str, str, int | str, int]]],
    section_scores: dict[str, int],
) -> None:
    questions = []
    for field in ("1", "2", "3", "4"):
        subs = []
        for label, mark, correct, score in sections[field]:
            if isinstance(correct, int):
                answer = {"correct_option": str(correct), "correct_index": correct}
            else:
                answer = {"correct_option": correct, "correct_index": correct}
            subs.append(
                {
                    "question_id": f"{title} 第{field}問 {label} [{mark}]",
                    "label": label,
                    "mark_symbol": mark,
                    "score": score,
                    "context": (
                        f"{title} 第{field}問 {label}（解答記号 {mark}）。"
                        "問題文・選択肢は問題PDFを参照し、マークで解答してください。"
                    ),
                    "options": [],
                    "answer": answer,
                    "explanation": f"正解は解答・解説PDFの第{field}問 {label}（{mark}）を参照。",
                }
            )
        questions.append(
            {
                "section_id": f"第{field}問",
                "section_title": f"第{field}問",
                "section_score": section_scores[field],
                "sub_questions": subs,
            }
        )
    data = {
        "metadata": {
            "title": title,
            "subject": "情報Ⅰ",
            "total_score": 100,
            "description": "解答記号ごとに分割したマーク採点用データ（正解は模試解答・採点基準に準拠）",
        },
        "questions": questions,
    }
    text = json.dumps(data, ensure_ascii=False, indent=2)
    path = DATA / json_name
    path.write_text(text, encoding="utf-8")
    root = ROOT / json_name
    if root.exists():
        root.write_text(text, encoding="utf-8")
    n = sum(len(s["sub_questions"]) for s in questions)
    # estimate blanks
    blanks = 0
    for field, rows in sections.items():
        for _, mark, correct, _ in rows:
            if isinstance(correct, str) and ":" in correct:
                blanks += correct.count(":")
            else:
                blanks += len([x for x in mark.replace("・", " ").split() if x])
    print(f"wrote {path} rows={n}")


# --- 河合塾 2025 第3回（解答・採点基準 p.48） ---
# 第1問 12 / 第2問 12 / 第3問 20 / 第4問 11 = 55
KAWAI3 = {
    "1": [
        ("問1", "ア", 2, 1),
        ("問1", "イ", 2, 2),
        ("問2", "ウ", 2, 2),
        ("問2", "エ", 3, 1),
        ("問3", "オ", 3, 2),
        ("問3", "カ", 2, 2),
        ("問3", "キ", 10, 2),  # ⑩
        ("問4", "ク", 2, 1),
        ("問4", "ケ", 3, 1),
        ("問4", "コ", 1, 2),
        ("問4", "サ", 2, 2),
        ("問4", "シ", 2, 2),
    ],
    "2": [
        ("問1A", "ア", 1, 3),
        ("問2A", "イ・ウ", "イ: 8, ウ: 0", 3),
        ("問3A", "エ", 10, 3),  # ⑩
        ("問4A", "オ", 2, 3),
        ("問4A", "カ・キ", "カ: 6, キ: 3", 3),
        ("問1B", "ク", 2, 3),
        ("問1B", "ケ", 5, 3),
        ("問2B", "コ", 5, 3),
        ("問3B", "サ", 1, 3),
        ("問4B", "シ", 10, 3),  # ⑩
    ],
    "3": [
        ("問1", "ア", 10, 1),
        ("問1", "イ", 10, 1),
        ("問1", "ウ", 1, 1),
        ("問2", "エ", 4, 1),
        ("問2", "オ", 0, 1),
        ("問2", "カ", 10, 2),
        ("問3", "キ", 2, 1),
        ("問3", "ク", 1, 1),
        ("問4", "ケ", 0, 1),
        ("問4", "コ", 1, 1),
        ("問4", "サ・シ", "サ: 2, シ: 1", 2),
        ("問4", "ス・セ", "ス: 3, セ: 0", 2),
        ("問5", "ソ", 3, 2),
        ("問5", "タ", 1, 2),
        ("問5", "チ・ツ", "チ: 1, ツ: 0", 3),
        ("問5", "テ・ト", "テ: 1, ト: 5", 3),
    ],
    "4": [
        ("問1", "ア", 10, 3),
        ("問2", "イ", 1, 2),
        ("問2", "ウ", 5, 2),
        ("問2", "エ・オ", "エ: 6, オ: 3", 3),
        ("問3", "カ", 5, 2),
        ("問3", "キ", 7, 2),
        ("問3", "ク", 6, 2),
        ("問3", "ケ", 4, 3),
        ("問4", "コ", 2, 3),
        ("問5", "サ", 2, 3),
    ],
}

# --- 進研マーク 2025 9月（正解・配点一覧） ---
# 第1問 14 / 第2問 13 / 第3問 17 / 第4問 8 = 52
SHINKEN09 = {
    "1": [
        ("問1", "ア", 0, 2),
        ("問1", "イ・ウ", "イ: 1, ウ: 4", 2),  # 順不同 各1
        ("問2", "エ", 3, 1),
        ("問2", "オ・カ", "オ: 4, カ: 7", 2),
        ("問3", "キ", 2, 2),
        ("問3", "ク・ケ", "ク: 2, ケ: 2", 2),
        ("問3", "コ", 1, 2),
        ("問3", "サ", 2, 2),
        ("問4", "シ", 3, 1),
        ("問4", "ス", 1, 2),
        ("問4", "セ", 3, 2),
    ],
    "2": [
        ("問1A", "ア", 9, 3),
        ("問2A", "イ", 1, 3),
        ("問3A", "ウ", 3, 3),
        ("問4A", "エ・オ", "エ: 1, オ: 1", 4),
        ("問5A", "カ", 2, 2),
        ("問1B", "キ", 5, 2),
        ("問1B", "ク", 3, 2),
        ("問2B", "ケ", 2, 2),
        ("問2B", "コ", 5, 2),
        ("問3B", "サ・シ", "サ: 1, シ: 6", 3),
        ("問3B", "ス", 3, 4),
    ],
    "3": [
        ("問1", "ア", 0, 1),
        ("問1", "イ・ウ・エ", "イ: 4, ウ: 9, エ: 0", 3),
        ("問1", "オ・カ・キ", "オ: 1, カ: 8, キ: 0", 3),
        ("問2", "ク", 2, 2),
        ("問2", "ケ", 3, 1),
        ("問2", "コ", 6, 2),
        ("問2", "サ", 2, 2),
        ("問3", "シ", 1, 2),
        ("問3", "ス", 1, 2),
        ("問3", "セ", 2, 3),
        ("問3", "ソ", 2, 2),
        ("問3", "タ", 1, 1),
        ("問3", "チ", 0, 1),
    ],
    "4": [
        ("問1", "ア", 2, 3),
        ("問2", "イ", 9, 4),
        ("問3", "ウ", 1, 3),
        ("問4", "エ", 3, 4),
        ("問4", "オ", 2, 3),
        ("問5", "カ・キ", "カ: 2, キ: 4", 4),  # 順不同 各2
        ("問6", "ク", 7, 4),
    ],
}


if __name__ == "__main__":
    write_exam(
        "kawai_2025_info1_3rd.json",
        "河合塾 2025 第3回",
        KAWAI3,
        {"1": 20, "2": 30, "3": 25, "4": 25},
    )
    write_exam(
        "shinken_2025_09_info1.json",
        "進研マーク 2025 9月",
        SHINKEN09,
        {"1": 20, "2": 30, "3": 25, "4": 25},
    )
