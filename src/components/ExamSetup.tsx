"use client";

import { QuestionCountSelector } from "@/components/QuestionCountSelector";
import type { ExamSettings, QuestionCountOption } from "@/lib/types";

type ExamSetupProps = {
  categories: string[];
  categoryCounts: Record<string, number>;
  totalCount: number;
  settings: ExamSettings;
  poolSize: number;
  onChange: (settings: ExamSettings) => void;
  onStart: () => void;
};

export function ExamSetup({
  categories,
  categoryCounts,
  totalCount,
  settings,
  poolSize,
  onChange,
  onStart,
}: ExamSetupProps) {
  if (totalCount === 0) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4">
        <header>
          <p className="text-sm font-medium text-blue-600">簡易テスト</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">問題演習</h1>
        </header>
        <div className="rounded-2xl bg-white px-5 py-8 text-center ring-1 ring-slate-100">
          <p className="text-sm font-semibold text-slate-700">
            まだテスト問題がありません
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            本番形式の問題を{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-blue-700">
              src/data/exam_questions.json
            </code>{" "}
            に追加すると、ここで数分の択一演習ができます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-4">
      <header>
        <p className="text-sm font-medium text-blue-600">簡易テスト</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">問題演習</h1>
        <p className="mt-1 text-sm text-slate-500">
          本番形式の択一問題を、短時間で解いて確認できます。
        </p>
      </header>

      <div className="space-y-2">
        <label
          htmlFor="exam-category"
          className="block text-sm font-semibold text-slate-700"
        >
          カテゴリ（分野）
        </label>
        <select
          id="exam-category"
          value={settings.category}
          onChange={(e) => onChange({ ...settings, category: e.target.value })}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">すべて（{totalCount}問）</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}（{categoryCounts[cat] ?? 0}問）
            </option>
          ))}
        </select>
      </div>

      <QuestionCountSelector
        countOption={settings.countOption}
        customCount={settings.customCount}
        maxCount={poolSize}
        onCountOptionChange={(countOption: QuestionCountOption) =>
          onChange({ ...settings, countOption })
        }
        onCustomCountChange={(customCount) =>
          onChange({ ...settings, customCount })
        }
      />

      <button
        type="button"
        onClick={onStart}
        disabled={poolSize === 0}
        className="mt-2 w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        スタート
      </button>
    </div>
  );
}
