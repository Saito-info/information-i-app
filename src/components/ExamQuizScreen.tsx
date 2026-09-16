"use client";

import { PdfPageViewer } from "@/components/PdfPageViewer";
import type {
  ExamQuestion,
  ExamResults,
  ExamSessionMeta,
} from "@/lib/types";
import { useMemo, useState } from "react";

type ExamQuizScreenProps = {
  questions: ExamQuestion[];
  meta: ExamSessionMeta;
  onFinish: (results: ExamResults) => void;
  onExit: () => void;
};

export function ExamQuizScreen({
  questions,
  meta,
  onFinish,
  onExit,
}: ExamQuizScreenProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const current = questions[index];
  const pageImages = useMemo(() => {
    return current?.pageImages?.length
      ? current.pageImages
      : (questions[0]?.pageImages ?? []);
  }, [current, questions]);

  if (!current) {
    return (
      <div className="px-4 py-8 text-center text-slate-500">
        出題できる問題がありません。
        <button
          type="button"
          onClick={onExit}
          className="mt-4 block w-full rounded-xl bg-blue-600 py-3 font-semibold text-white"
        >
          戻る
        </button>
      </div>
    );
  }

  const selected = answers[current.id];
  const progress = ((index + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const canGrade = answeredCount > 0;

  function buildResults(interrupted: boolean): ExamResults {
    const answered = questions.filter((q) => answers[q.id] != null);
    let correct = 0;
    let incorrect = 0;
    let scoreEarned = 0;
    let scoreMax = 0;
    const wrongIds: string[] = [];
    const correctIds: string[] = [];

    for (const q of answered) {
      const pts = q.score ?? 1;
      scoreMax += pts;
      if (answers[q.id] === q.answerIndex) {
        correct += 1;
        scoreEarned += pts;
        correctIds.push(q.id);
      } else {
        incorrect += 1;
        wrongIds.push(q.id);
      }
    }

    return {
      correct,
      incorrect,
      total: answered.length,
      scoreEarned,
      scoreMax,
      interrupted,
      wrongIds,
      correctIds,
      answers: { ...answers },
    };
  }

  function handleGrade(interrupted: boolean) {
    if (!canGrade) {
      onExit();
      return;
    }
    const label = interrupted ? "ここまでで採点しますか？" : "採点しますか？";
    const ok = window.confirm(
      `${label}\n解答済み ${answeredCount}/${questions.length} 問を採点します。`,
    );
    if (!ok) return;
    onFinish(buildResults(interrupted));
  }

  function handleBack() {
    if (index <= 0) return;
    setIndex((i) => i - 1);
  }

  function handleForward() {
    if (index + 1 >= questions.length) return;
    setIndex((i) => i + 1);
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-0px)] w-full max-w-lg flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-blue-100 bg-white px-3 py-2">
        <button
          type="button"
          onClick={() => handleGrade(true)}
          className="text-xs font-medium text-slate-500"
        >
          中断して採点
        </button>
        <div className="min-w-0 text-right">
          <p className="truncate text-[11px] font-medium text-slate-500">
            {meta.sourceTitle}
          </p>
          <p className="text-xs font-semibold text-slate-700">
            {meta.fieldId === "all"
              ? `${current.sectionTitle} · `
              : `第${meta.fieldId}問 · `}
            {index + 1}/{questions.length}
            <span className="ml-1 font-normal text-slate-400">
              （解答済 {answeredCount}）
            </span>
          </p>
        </div>
      </div>

      <div className="h-1.5 shrink-0 bg-blue-100">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="h-[42vh] shrink-0 border-b border-slate-200">
        <PdfPageViewer
          key={current.fieldId + (pageImages[0] ?? "")}
          images={pageImages}
          title={`問題PDF（${current.sectionTitle}）`}
          className="h-full"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-3 rounded-xl bg-white px-3 py-3 ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {current.label ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {current.label}
              </span>
            ) : null}
            {current.markSymbol ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                マーク [{current.markSymbol}]
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-600">
                マークを選択
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            上のPDFを見ながら番号を選び、進む／戻るで移動できます
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2 pb-4">
          {current.choices.map((_, choiceIndex) => {
            const isSelected = selected === choiceIndex;
            return (
              <button
                key={choiceIndex}
                type="button"
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [current.id]: choiceIndex }))
                }
                className={`flex aspect-square items-center justify-center rounded-2xl text-lg font-bold transition ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50"
                }`}
              >
                {markDigit(choiceIndex)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 space-y-2 border-t border-slate-200 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={index <= 0}
            onClick={handleBack}
            className="rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-700 disabled:opacity-40"
          >
            ← 戻る
          </button>
          <button
            type="button"
            disabled={index + 1 >= questions.length}
            onClick={handleForward}
            className="rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-700 disabled:opacity-40"
          >
            進む →
          </button>
        </div>
        <button
          type="button"
          disabled={!canGrade}
          onClick={() => handleGrade(answeredCount < questions.length)}
          className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white disabled:bg-slate-300"
        >
          採点する（{answeredCount}/{questions.length}）
        </button>
      </div>
    </div>
  );
}

function markDigit(n: number): string {
  return ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][n] ?? String(n);
}
