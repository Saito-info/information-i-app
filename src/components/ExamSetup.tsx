"use client";

import { QuestionCountSelector } from "@/components/QuestionCountSelector";
import type { ExamSectionInfo, ExamSettings, QuestionCountOption } from "@/lib/types";

type ExamSetupProps = {
  sourceLabel: string;
  sections: ExamSectionInfo[];
  totalCount: number;
  settings: ExamSettings;
  poolSize: number;
  onChange: (settings: ExamSettings) => void;
  onStart: () => void;
};

export function ExamSetup({
  sourceLabel,
  sections,
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
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-4">
      <header>
        <p className="text-sm font-medium text-blue-600">簡易テスト</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">問題演習</h1>
        <p className="mt-1 text-sm text-slate-500">{sourceLabel}</p>
        <p className="mt-1 text-sm text-slate-500">
          大問（単元）ごと、またはすべてを選んでマークシート形式で演習できます。
        </p>
      </header>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          出題範囲（大問）
        </label>
        <div className="space-y-2">
          <SectionOption
            selected={settings.sectionId === "all"}
            title={`すべて（全${totalCount}問）`}
            subtitle="第1問〜第4問"
            onClick={() => onChange({ ...settings, sectionId: "all" })}
          />
          {sections.map((section) => (
            <SectionOption
              key={section.id}
              selected={settings.sectionId === section.id}
              title={section.title}
              subtitle={`${section.count}問${section.score != null ? `・配点${section.score}` : ""}`}
              onClick={() => onChange({ ...settings, sectionId: section.id })}
            />
          ))}
        </div>
      </div>

      <QuestionCountSelector
        countOption={settings.countOption}
        customCount={settings.customCount}
        maxCount={Math.max(1, poolSize)}
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
        スタート（{poolSize}問から出題）
      </button>
    </div>
  );
}

function SectionOption({
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
