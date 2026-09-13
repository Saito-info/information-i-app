"use client";

import type { ExamResults } from "@/lib/types";

type ExamResultScreenProps = {
  results: ExamResults;
  sourceTitle?: string;
  onBack: () => void;
};

export function ExamResultScreen({
  results,
  sourceTitle,
  onBack,
}: ExamResultScreenProps) {
  const graded = results.correct + results.incorrect;
  const accuracy =
    graded > 0 ? Math.round((results.correct / graded) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6">
      <div className="text-center">
        <p className="text-sm font-medium text-blue-600">テスト結果</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">
          {results.interrupted ? "途中までの結果" : "お疲れさま！"}
        </h2>
        {sourceTitle ? (
          <p className="mt-2 text-sm text-slate-500">{sourceTitle}</p>
        ) : null}
        <p className="mt-2 text-sm text-slate-500">
          採点 {graded}問中 {results.correct}問正解（正答率 {accuracy}%）
        </p>
        {results.selfGradeCount ? (
          <p className="mt-1 text-xs text-violet-600">
            自己確認（自動採点なし）: {results.selfGradeCount}問
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-emerald-50 px-3 py-4 text-center text-emerald-700 ring-1 ring-emerald-100">
          <p className="text-2xl font-bold">{results.correct}</p>
          <p className="mt-1 text-xs font-medium opacity-80">正解</p>
        </div>
        <div className="rounded-2xl bg-rose-50 px-3 py-4 text-center text-rose-700 ring-1 ring-rose-100">
          <p className="text-2xl font-bold">{results.incorrect}</p>
          <p className="mt-1 text-xs font-medium opacity-80">不正解</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99]"
      >
        設定に戻る
      </button>
    </div>
  );
}
