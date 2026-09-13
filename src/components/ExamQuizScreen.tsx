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
  const [selectedMulti, setSelectedMulti] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const correctCountRef = useRef(0);

  const current = questions[index];
  const progress = ((index + 1) / questions.length) * 100;
  const multi = Boolean(current?.multiSelect);

  const isCorrect = current
    ? multi
      ? sameSet(selectedMulti, current.answerIndexes ?? [current.answerIndex])
      : selected === current.answerIndex
    : false;

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

  function handleToggleMulti(choiceIndex: number) {
    if (checked) return;
    setSelectedMulti((prev) =>
      prev.includes(choiceIndex)
        ? prev.filter((x) => x !== choiceIndex)
        : [...prev, choiceIndex].sort((a, b) => a - b),
    );
  }

  function handleCheck() {
    if (checked || !current) return;
    if (multi) {
      if (selectedMulti.length === 0) return;
    } else if (selected === null) {
      return;
    }

    const ok = multi
      ? sameSet(selectedMulti, current.answerIndexes ?? [current.answerIndex])
      : selected === current.answerIndex;

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
    setSelectedMulti([]);
    setChecked(false);
  }

  const canSubmit = multi ? selectedMulti.length > 0 : selected !== null;

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
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-600">
            {current.sourceTitle}
          </span>
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
            {current.sectionTitle}
          </span>
          {current.targetLabel ? (
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
              [{current.targetLabel}]
            </span>
          ) : null}
          {multi ? (
            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-700">
              複数選択
            </span>
          ) : null}
        </div>

        {(current.context || current.figure) && (
          <div className="mb-4 space-y-3">
            <p className="text-xs font-semibold tracking-wide text-blue-600">
              共通の問題文・資料
            </p>
            {current.context ? (
              <div className="max-h-56 overflow-y-auto rounded-xl bg-slate-50 px-3 py-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {current.context}
              </div>
            ) : null}
            {current.figure ? (
              <div className="max-h-64 overflow-auto rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-3 py-3 text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">
                {current.figure}
              </div>
            ) : null}
          </div>
        )}

        <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500">
          設問
        </p>
        <p className="whitespace-pre-wrap text-base font-semibold leading-relaxed text-slate-800">
          {current.question}
        </p>
      </div>

      <div className="space-y-2">
        {current.choices.map((label, choiceIndex) => {
          const isSelected = multi
            ? selectedMulti.includes(choiceIndex)
            : selected === choiceIndex;
          const isAnswer = multi
            ? (current.answerIndexes ?? []).includes(choiceIndex)
            : choiceIndex === current.answerIndex;

          let style =
            "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50";

          if (checked) {
            if (isAnswer) {
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
              onClick={() =>
                multi
                  ? handleToggleMulti(choiceIndex)
                  : setSelected(choiceIndex)
              }
              className={`flex w-full items-start gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition disabled:cursor-default ${style}`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-bold">
                {markDigit(choiceIndex)}
              </span>
              <span className="leading-relaxed">{stripLeadingMark(label)}</span>
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
          {!isCorrect && (
            <p className="mt-1 text-xs opacity-90">
              正解:{" "}
              {(current.answerIndexes ?? [current.answerIndex])
                .map(markDigit)
                .join("・")}
            </p>
          )}
          {current.explanation ? (
            <p className="mt-1 whitespace-pre-wrap leading-relaxed opacity-90">
              {current.explanation}
            </p>
          ) : null}
        </div>
      )}

      {!checked ? (
        <button
          type="button"
          onClick={handleCheck}
          disabled={!canSubmit}
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

function markDigit(n: number): string {
  return ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][n] ?? String(n);
}

function stripLeadingMark(label: string): string {
  return label.replace(/^[⓪①②③④⑤⑥⑦⑧⑨]\s*/, "");
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}
