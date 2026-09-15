"use client";

import { QuestionCountSelector } from "@/components/QuestionCountSelector";
import type { QuestionCountOption, StudySettings } from "@/lib/types";

/** 情報Ⅰの4分野（学習選択用） */
export const STUDY_FIELDS = [
  "情報社会の問題解決",
  "コミュニケーションと情報デザイン",
  "コンピュータとプログラミング",
  "情報通信ネットワークとデータの活用",
] as const;

type StudySetupProps = {
  categoryCounts: Record<string, number>;
  totalCount: number;
  settings: StudySettings;
  poolSize: number;
  onChange: (settings: StudySettings) => void;
  onStart: () => void;
};

export function StudySetup({
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
          4つの分野から選んで学習できます。
        </p>
      </header>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          分野
        </label>
        <div className="space-y-2">
          <FieldOption
            selected={settings.category === "all"}
            title={`すべて（${totalCount}語）`}
            subtitle="4分野まとめて出題"
            onClick={() => onChange({ ...settings, category: "all" })}
          />
          {STUDY_FIELDS.map((field) => (
            <FieldOption
              key={field}
              selected={settings.category === field}
              title={field}
              subtitle={`${categoryCounts[field] ?? 0}語`}
              onClick={() => onChange({ ...settings, category: field })}
            />
          ))}
        </div>
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

function FieldOption({
  selected,
  title,
  subtitle,
  onClick,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-left transition ${
        selected
          ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50"
      }`}
    >
      <p className="text-sm font-semibold leading-snug">{title}</p>
      <p
        className={`mt-0.5 text-xs ${selected ? "text-blue-100" : "text-slate-400"}`}
      >
        {subtitle}
      </p>
    </button>
  );
}
