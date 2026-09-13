"use client";

import type {
  ExamFieldInfo,
  ExamSettings,
} from "@/lib/types";

type ExamSetupProps = {
  sourceLabel: string;
  fields: ExamFieldInfo[];
  sourceCount: number;
  settings: ExamSettings;
  canStart: boolean;
  onChange: (settings: ExamSettings) => void;
  onStart: () => void;
};

export function ExamSetup({
  sourceLabel,
  fields,
  sourceCount,
  settings,
  canStart,
  onChange,
  onStart,
}: ExamSetupProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-4">
      <header>
        <p className="text-sm font-medium text-blue-600">テスト</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">問題演習</h1>
        <p className="mt-1 text-sm text-slate-500">{sourceLabel}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          大問（分野）を選ぶと、問題集はランダムに決まります。出題順は正規の順番です。
        </p>
      </header>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          出題する分野
        </label>
        <div className="space-y-2">
          {fields.map((field) => (
            <OptionButton
              key={field.id}
              selected={settings.fieldId === field.id}
              title={field.title}
              subtitle={
                field.id === "all"
                  ? `${sourceCount}冊からランダムに1冊`
                  : `${field.sourceCount}冊からランダム`
              }
              onClick={() =>
                onChange({
                  ...settings,
                  fieldId: field.id,
                })
              }
            />
          ))}
        </div>
      </div>

      {settings.fieldId === "all" ? (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            解答の確認タイミング
          </label>
          <div className="space-y-2">
            <OptionButton
              selected={settings.reviewMode === "per-section"}
              title="各大問の終わりに確認"
              subtitle="第〇問が終わったらその場で採点・解説"
              onClick={() =>
                onChange({ ...settings, reviewMode: "per-section" })
              }
            />
            <OptionButton
              selected={settings.reviewMode === "at-end"}
              title="すべて終わってから確認"
              subtitle="最後まで解いてからまとめて採点"
              onClick={() => onChange({ ...settings, reviewMode: "at-end" })}
            />
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800 ring-1 ring-blue-100">
          選んだ大問が終わると、まとめて解答と解説を確認できます。途中で中断しても、そこまでの採点が可能です。
        </p>
      )}

      <button
        type="button"
        onClick={onStart}
        disabled={!canStart}
        className="mt-2 w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        スタート
      </button>
    </div>
  );
}

function OptionButton({
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
