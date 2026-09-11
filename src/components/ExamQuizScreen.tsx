"use client";

import type { ExamQuestion, ExamResults } from "@/lib/types";
import { useRef, useState } from "react";

type ExamQuizScreenProps = {
  questions: ExamQuestion[];
  onFinish: (results: ExamResults) => void;
  onExit: () => void;
};

export function ExamQuizScreen({
  questions,
  onFinish,
  onExit,
}: ExamQuizScreenProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const correctCountRef = useRef(0);

  const current = questions[index];
  const progress = ((index + 1) / questions.length) * 100;
  const isCorrect = selected === current?.answerIndex;

  if (!current) {
    return (
      <div className="px-4 py-8 text-center text-slate-500">
        出題できる問題がありません。
        <button
          type="button"
          onClick={onExit}
          className="mt-4 block w-full rounded-xl bg-blue-600 py-3 font-semibold text-white"
        >
          設定に戻る
        </button>
      </div>
    );
  }

  function handleCheck() {
    if (selected === null || checked) return;
    const ok = selected === current.answerIndex;
    const nextCorrect = correctCount + (ok ? 1 : 0);
    correctCountRef.current = nextCorrect;
    setCorrectCount(nextCorrect);
    setChecked(true);
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      onFinish({
        correct: correctCountRef.current,
        incorrect: questions.length - correctCountRef.current,
        total: questions.length,
      });
      return;
    }

    setIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-4 pt-2">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          ← 中断
        </button>
        <p className="text-sm font-semibold text-slate-700">
          {index + 1}問目 / 全{questions.length}問
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-slate-100">
        <p className="mb-2 inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-600">
          {current.category}
        </p>
        <p className="text-base font-semibold leading-relaxed text-slate-800">
          {current.question}
        </p>
      </div>

      <div className="space-y-2">
        {current.choices.map((label, choiceIndex) => {
          const isSelected = selected === choiceIndex;
          let style =
            "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50";

          if (checked) {
            if (choiceIndex === current.answerIndex) {
              style = "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300";
            } else if (isSelected) {
              style = "bg-rose-50 text-rose-800 ring-1 ring-rose-300";
            } else {
              style = "bg-slate-50 text-slate-400 ring-1 ring-slate-100";
            }
          } else if (isSelected) {
            style = "bg-blue-600 text-white ring-1 ring-blue-600";
          }

          return (
            <button
              key={choiceIndex}
              type="button"
              disabled={checked}
              onClick={() => setSelected(choiceIndex)}
              className={`flex w-full items-start gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition disabled:cursor-default ${style}`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-bold">
                {String.fromCharCode(65 + choiceIndex)}
              </span>
              <span className="leading-relaxed">{label}</span>
            </button>
          );
        })}
      </div>

      {checked && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            isCorrect
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          <p className="font-bold">{isCorrect ? "正解！" : "不正解"}</p>
          {current.explanation ? (
            <p className="mt-1 leading-relaxed opacity-90">
              {current.explanation}
            </p>
          ) : null}
        </div>
      )}

      {!checked ? (
        <button
          type="button"
          onClick={handleCheck}
          disabled={selected === null}
          className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          解答する
        </button>
      ) : (
        <button
          type="button"
          onClick={handleNext}
          className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
        >
          {index + 1 >= questions.length ? "結果を見る" : "次の問題へ"}
        </button>
      )}
    </div>
  );
}
