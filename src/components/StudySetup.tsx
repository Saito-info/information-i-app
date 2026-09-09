"use client";

import { QuestionCountSelector } from "@/components/QuestionCountSelector";
import type { QuestionCountOption, StudySettings } from "@/lib/types";

type StudySetupProps = {
  categories: string[];
  categoryCounts: Record<string, number>;
  totalCount: number;
  settings: StudySettings;
  poolSize: number;
  onChange: (settings: StudySettings) => void;
  onStart: () => void;
};

export function StudySetup({
  categories,
  categoryCounts,
  totalCount,
  settings,
  poolSize,
  onChange,
  onStart,
}: StudySetupProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-4">
      <header>
        <p className="text-sm font-medium text-blue-600">学習モード</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">出題設定</h1>
        <p className="mt-1 text-sm text-slate-500">
          分野と出題数を選んでスタートしましょう。
        </p>
      </header>

      <div className="space-y-2">
        <label
          htmlFor="category"
          className="block text-sm font-semibold text-slate-700"
        >
          カテゴリ（分野）
        </label>
        <select
          id="category"
          value={settings.category}
          onChange={(e) => onChange({ ...settings, category: e.target.value })}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">すべて（{totalCount}語）</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}（{categoryCounts[cat] ?? 0}語）
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
