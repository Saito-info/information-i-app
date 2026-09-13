"use client";

import type { ExamSettings, ExamSourceInfo } from "@/lib/types";

type ExamSetupProps = {
  sourceLabel: string;
  sources: ExamSourceInfo[];
  totalCount: number;
  settings: ExamSettings;
  poolSize: number;
  onChange: (settings: ExamSettings) => void;
  onStart: () => void;
};

export function ExamSetup({
  sourceLabel,
  sources,
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
          分野を選ぶと、その中からランダムな順で出題されます。
        </p>
      </header>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          分野（テスト）
        </label>
        <div className="space-y-2">
          <SourceOption
            selected={settings.sourceId === "all"}
            title={`すべて（全${totalCount}問）`}
            subtitle="全分野からランダム出題"
            onClick={() => onChange({ sourceId: "all" })}
          />
          {sources.map((source) => (
            <SourceOption
              key={source.id}
              selected={settings.sourceId === source.id}
              title={source.title}
              subtitle={`${source.count}問・ランダム順`}
              onClick={() => onChange({ sourceId: source.id })}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={poolSize === 0}
        className="mt-2 w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        スタート（{poolSize}問・ランダム）
      </button>
    </div>
  );
}

function SourceOption({
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
