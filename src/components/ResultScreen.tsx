"use client";

import type { QuizResults } from "@/lib/types";

type ResultScreenProps = {
  results: QuizResults;
  onBack: () => void;
};

export function ResultScreen({ results, onBack }: ResultScreenProps) {
  const accuracy =
    results.total > 0
      ? Math.round((results.correct / results.total) * 100)
      : 0;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6">
      <div className="text-center">
        <p className="text-sm font-medium text-blue-600">結果</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">お疲れさま！</h2>
        <p className="mt-2 text-sm text-slate-500">
          {results.total}問中 {results.correct}問正解（正答率 {accuracy}%）
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="正解" value={results.correct} tone="correct" />
        <Stat label="あやふや" value={results.uncertain} tone="uncertain" />
        <Stat label="不正解" value={results.incorrect} tone="incorrect" />
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

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "correct" | "uncertain" | "incorrect";
}) {
  const styles = {
    correct: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    uncertain: "bg-amber-50 text-amber-700 ring-amber-100",
    incorrect: "bg-rose-50 text-rose-700 ring-rose-100",
  }[tone];

  return (
    <div className={`rounded-2xl px-3 py-4 text-center ring-1 ${styles}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}
