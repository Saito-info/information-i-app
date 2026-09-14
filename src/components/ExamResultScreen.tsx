"use client";

import { PdfPageViewer } from "@/components/PdfPageViewer";
import type { ExamQuestion, ExamResults, ExamSessionMeta } from "@/lib/types";
import { useState } from "react";

type ExamResultScreenProps = {
  results: ExamResults;
  meta: ExamSessionMeta;
  questions: ExamQuestion[];
  onBack: () => void;
};

export function ExamResultScreen({
  results,
  meta,
  questions,
  onBack,
}: ExamResultScreenProps) {
  const [showAnswers, setShowAnswers] = useState(true);
  const accuracy =
    results.total > 0
      ? Math.round((results.correct / results.total) * 100)
      : 0;

  const wrongQuestions = questions.filter((q) =>
    results.wrongIds.includes(q.id),
  );

  const answerImages =
    meta.answerPageImages.length > 0
      ? meta.answerPageImages
      : questions[0]?.answerPageImages ?? [];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4 pb-8">
      <div className="text-center">
        <p className="text-sm font-medium text-blue-600">テスト結果</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">
          {results.interrupted ? "途中までの結果" : "お疲れさま！"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {meta.sourceTitle} · 第{meta.fieldId}問
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {results.total}問中 {results.correct}問正解（正答率 {accuracy}%）
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-700">
          得点 {results.scoreEarned} / {results.scoreMax}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-emerald-50 px-3 py-4 text-center text-emerald-700 ring-1 ring-emerald-100">
          <p className="text-2xl font-bold">{results.correct}</p>
          <p className="mt-1 text-xs">正解</p>
        </div>
        <div className="rounded-2xl bg-rose-50 px-3 py-4 text-center text-rose-700 ring-1 ring-rose-100">
          <p className="text-2xl font-bold">{results.incorrect}</p>
          <p className="mt-1 text-xs">不正解</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-slate-100">
        <button
          type="button"
          onClick={() => setShowAnswers((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-sm font-semibold text-slate-800">
            解説・解答
          </span>
          <span className="text-xs text-blue-600">
            {showAnswers ? "閉じる" : "開く"}
          </span>
        </button>
        {showAnswers ? (
          <div className="border-t border-slate-100">
            {answerImages.length ? (
              <div className="h-[50vh]">
                <PdfPageViewer
                  images={answerImages}
                  title="解答・解説PDF"
                  className="h-full"
                />
              </div>
            ) : (
              <div className="max-h-[50vh] space-y-3 overflow-y-auto px-4 py-3">
                <p className="text-xs text-slate-500">
                  解答PDFがない試験のため、解説テキストを表示します。
                </p>
                {(wrongQuestions.length ? wrongQuestions : questions).map(
                  (q) => (
                    <div
                      key={q.id}
                      className="rounded-xl bg-slate-50 px-3 py-3 text-sm"
                    >
                      <p className="font-semibold text-slate-800">
                        {q.label ?? q.id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        正解: {markDigit(q.answerIndex)}
                      </p>
                      {q.explanation ? (
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                          {q.explanation}
                        </p>
                      ) : null}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {wrongQuestions.length > 0 ? (
        <p className="text-center text-xs text-rose-600">
          間違えた {wrongQuestions.length}{" "}
          問は復習タブからやり直せます。
        </p>
      ) : null}

      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white"
      >
        設定に戻る
      </button>
    </div>
  );
}

function markDigit(n: number): string {
  return ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][n] ?? String(n);
}
