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
  const [showPdf, setShowPdf] = useState(true);
  const accuracy =
    results.total > 0
      ? Math.round((results.correct / results.total) * 100)
      : 0;

  const answerImages =
    meta.answerPageImages.length > 0
      ? meta.answerPageImages
      : (questions[0]?.answerPageImages ?? []);

  const reviewed = questions.filter((q) => results.answers[q.id] != null);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4 pb-8">
      <div className="text-center">
        <p className="text-sm font-medium text-blue-600">解答確認</p>
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

      <section className="rounded-2xl bg-white ring-1 ring-slate-100">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-800">解答一覧</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            あなたの解答と正解を比較できます
          </p>
        </div>
        <ul className="divide-y divide-slate-100">
          {reviewed.map((q, i) => {
            const yours = results.answers[q.id];
            const ok = yours === q.answerIndex;
            return (
              <li key={q.id} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    ok
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {ok ? "正" : "誤"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {i + 1}. {q.label ?? "設問"}
                    {q.markSymbol ? (
                      <span className="ml-1 font-medium text-slate-500">
                        [{q.markSymbol}]
                      </span>
                    ) : null}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <span className="text-slate-600">
                      あなたの解答:{" "}
                      <strong className={ok ? "text-emerald-700" : "text-rose-700"}>
                        {yours != null ? markDigit(yours) : "—"}
                      </strong>
                    </span>
                    <span className="text-slate-600">
                      正解:{" "}
                      <strong className="text-emerald-700">
                        {markDigit(q.answerIndex)}
                      </strong>
                    </span>
                  </div>
                  {!ok && q.explanation ? (
                    <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-500">
                      {q.explanation}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        {reviewed.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            解答した設問がありません
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl bg-white ring-1 ring-slate-100">
        <button
          type="button"
          onClick={() => setShowPdf((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-sm font-semibold text-slate-800">
            解答・解説PDF
          </span>
          <span className="text-xs text-blue-600">
            {showPdf ? "閉じる" : "開く"}
          </span>
        </button>
        {showPdf ? (
          <div className="border-t border-slate-100">
            {answerImages.length ? (
              <div className="h-[50vh]">
                <PdfPageViewer
                  images={answerImages}
                  title="解答・解説"
                  className="h-full"
                />
              </div>
            ) : (
              <div className="max-h-[40vh] space-y-3 overflow-y-auto px-4 py-3">
                <p className="text-xs text-slate-500">
                  この試験には解答PDFがないため、解説テキストを表示します。
                </p>
                {reviewed.map((q) =>
                  q.explanation ? (
                    <div
                      key={q.id}
                      className="rounded-xl bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-600"
                    >
                      <p className="mb-1 font-semibold text-slate-800">
                        {q.label ?? q.id}
                      </p>
                      <p className="whitespace-pre-wrap">{q.explanation}</p>
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </div>
        ) : null}
      </section>

      {results.wrongIds.length > 0 ? (
        <p className="text-center text-xs text-rose-600">
          間違えた {results.wrongIds.length} 問は復習タブからやり直せます。
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
