"use client";

import { PdfPageViewer } from "@/components/PdfPageViewer";
import type { ExamQuestion, ExamResults, ExamSessionMeta } from "@/lib/types";
import { useMemo, useState } from "react";

type ExamResultScreenProps = {
  results: ExamResults;
  meta: ExamSessionMeta;
  questions: ExamQuestion[];
  onBack: () => void;
};

type PdfMode = "answer" | "explanation";

export function ExamResultScreen({
  results,
  meta,
  questions,
  onBack,
}: ExamResultScreenProps) {
  const accuracy =
    results.total > 0
      ? Math.round((results.correct / results.total) * 100)
      : 0;

  const answerImages =
    meta.answerPageImages.length > 0
      ? meta.answerPageImages
      : (questions[0]?.answerPageImages ?? []);

  const explanationStartIndex = useMemo(() => {
    if (typeof meta.explanationStartIndex === "number") {
      return meta.explanationStartIndex;
    }
    const fromQ = questions[0]?.explanationStartIndex;
    return typeof fromQ === "number" ? fromQ : null;
  }, [meta.explanationStartIndex, questions]);

  const hasExplanationPdf =
    answerImages.length > 0 &&
    explanationStartIndex != null &&
    explanationStartIndex < answerImages.length &&
    (explanationStartIndex > 0 || answerImages.length > 1);

  const [pdfMode, setPdfMode] = useState<PdfMode>(
    hasExplanationPdf ? "explanation" : "answer",
  );
  const [showPdf, setShowPdf] = useState(true);

  const viewerInitialPage =
    pdfMode === "explanation" && explanationStartIndex != null
      ? explanationStartIndex
      : 0;

  const reviewed = questions.filter((q) => results.answers[q.id] != null);

  // プレースホルダ解説（「PDFを参照」だけ）は一覧に出さない
  const realExplanations = reviewed.filter(
    (q) =>
      q.explanation &&
      !q.explanation.includes("解答・解説PDF") &&
      q.explanation.trim().length > 20,
  );

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4 pb-8">
      <div className="text-center">
        <p className="text-sm font-medium text-blue-600">解答確認</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">
          {results.interrupted ? "途中までの結果" : "お疲れさま！"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {meta.sourceTitle} ·{" "}
          {meta.fieldId === "all" ? "すべて" : `第${meta.fieldId}問`}
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
                      <strong
                        className={ok ? "text-emerald-700" : "text-rose-700"}
                      >
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
              <>
                <div className="flex gap-2 px-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setPdfMode("answer")}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                      pdfMode === "answer"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    正答表
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfMode("explanation")}
                    disabled={!hasExplanationPdf}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      pdfMode === "explanation"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    解説
                    {hasExplanationPdf && explanationStartIndex != null
                      ? `（${explanationStartIndex + 1}ページ〜）`
                      : ""}
                  </button>
                </div>
                {!hasExplanationPdf ? (
                  <p className="px-4 pt-2 text-[11px] leading-relaxed text-amber-700">
                    この試験の収録PDFには正答表のみがあり、詳細な解説ページは含まれていません（共通テストの公式解答など）。
                  </p>
                ) : (
                  <p className="px-4 pt-2 text-[11px] leading-relaxed text-slate-500">
                    「解説」を選ぶと解説ページへ移動します。前後のページは下のボタンで切り替えられます。
                  </p>
                )}
                <div className="mt-2 h-[62vh]">
                  <PdfPageViewer
                    key={`${pdfMode}-${viewerInitialPage}`}
                    images={answerImages}
                    title={
                      pdfMode === "explanation" ? "解説PDF" : "正答表PDF"
                    }
                    initialPage={viewerInitialPage}
                    className="h-full"
                  />
                </div>
              </>
            ) : (
              <p className="px-4 py-3 text-xs text-slate-500">
                この試験には解答・解説PDFがありません。
              </p>
            )}
            {realExplanations.length > 0 ? (
              <div className="max-h-[30vh] space-y-3 overflow-y-auto border-t border-slate-100 px-4 py-3">
                <p className="text-xs font-semibold text-slate-600">
                  補足テキスト
                </p>
                {realExplanations.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-600"
                  >
                    <p className="mb-1 font-semibold text-slate-800">
                      {q.label ?? q.id}
                      {q.markSymbol ? ` [${q.markSymbol}]` : ""}
                    </p>
                    <p className="whitespace-pre-wrap">{q.explanation}</p>
                  </div>
                ))}
              </div>
            ) : null}
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
  if (n >= 0 && n <= 10) {
    return "⓪①②③④⑤⑥⑦⑧⑨⑩"[n] ?? String(n);
  }
  if (n >= 11 && n <= 15) {
    return "abcde"[n - 11] ?? String(n);
  }
  return String(n);
}
