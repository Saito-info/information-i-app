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
    };
  }

  function handleInterrupt() {
    if (Object.keys(answers).length === 0) {
      onExit();
      return;
    }
    const ok = window.confirm(
      "ここまでで採点しますか？\n終了後に解説（解答）を表示します。",
    );
    if (!ok) return;
    onFinish(buildResults(true));
  }

  function handleNext() {
    if (selected == null) return;
    if (index + 1 >= questions.length) {
      onFinish(buildResults(false));
      return;
    }
    setIndex((i) => i + 1);
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-0px)] w-full max-w-lg flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-blue-100 bg-white px-3 py-2">
        <button
          type="button"
          onClick={handleInterrupt}
          className="text-xs font-medium text-slate-500"
        >
          中断して採点
        </button>
        <div className="min-w-0 text-right">
          <p className="truncate text-[11px] font-medium text-slate-500">
            {meta.sourceTitle}
          </p>
          <p className="text-xs font-semibold text-slate-700">
            第{meta.fieldId}問 · {index + 1}/{questions.length}
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
          images={pageImages}
          title={`問題PDF（第${meta.fieldId}問）`}
          className="h-full"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-3 rounded-xl bg-white px-3 py-3 ring-1 ring-slate-100">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {current.label ? (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                {current.label}
              </span>
            ) : null}
            {current.markSymbol ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                [{current.markSymbol}]
              </span>
            ) : null}
          </div>
          <p className="max-h-28 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {current.question}
          </p>
        </div>

        <p className="mb-2 text-xs font-semibold text-slate-500">マーク解答</p>
        <div className="space-y-2 pb-4">
          {current.choices.map((label, choiceIndex) => {
            const isSelected = selected === choiceIndex;
            return (
              <button
                key={choiceIndex}
                type="button"
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [current.id]: choiceIndex }))
                }
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-bold">
                  {markDigit(choiceIndex)}
                </span>
                <span className="leading-relaxed">{stripMark(label)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          disabled={selected == null}
          onClick={handleNext}
          className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white disabled:bg-slate-300"
        >
          {index + 1 >= questions.length ? "終了して採点" : "次の設問へ"}
        </button>
      </div>
    </div>
  );
}

function markDigit(n: number): string {
  return ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][n] ?? String(n);
}

function stripMark(label: string): string {
  return label.replace(/^[⓪①②③④⑤⑥⑦⑧⑨]\s*/, "");
}
