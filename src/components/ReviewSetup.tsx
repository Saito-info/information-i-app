"use client";

import { QuestionCountSelector } from "@/components/QuestionCountSelector";
import type { LearningRecord } from "@/lib/storage";
import type {
  QuestionCountOption,
  ReviewFilter,
  ReviewMode,
  ReviewSettings,
} from "@/lib/types";

type ReviewSetupProps = {
  settings: ReviewSettings;
  record: LearningRecord;
  examWrongCount: number;
  poolSize: number;
  onChange: (settings: ReviewSettings) => void;
  onStart: () => void;
};

const MODES: { value: ReviewMode; label: string; hint: string }[] = [
  { value: "terms", label: "用語の復習", hint: "学習で記録した用語" },
  { value: "exam", label: "テストの復習", hint: "間違えたマーク問題" },
];

const FILTERS: { value: ReviewFilter; label: string; hint: string }[] = [
  { value: "all", label: "すべて", hint: "不正解＋あやふや" },
  { value: "incorrect", label: "不正解のみ", hint: "苦手な用語" },
  { value: "uncertain", label: "あやふやのみ", hint: "もう一度確認" },
];

export function ReviewSetup({
  settings,
  record,
  examWrongCount,
  poolSize,
  onChange,
  onStart,
}: ReviewSetupProps) {
  const incorrectCount = record.incorrectIds.length;
  const uncertainCount = record.uncertainIds.length;
  const allCount = new Set([
    ...record.incorrectIds,
    ...record.uncertainIds,
  ]).size;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-4">
      <header>
        <p className="text-sm font-medium text-blue-600">復習モード</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">出題設定</h1>
        <p className="mt-1 text-sm text-slate-500">
          用語の苦手克服と、テストで間違えた問題の復習ができます。
        </p>
      </header>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          復習の種類
        </label>
        <div className="space-y-2">
          {MODES.map((m) => {
            const selected = settings.mode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => onChange({ ...settings, mode: m.value })}
                className={`w-full rounded-xl px-4 py-3 text-left transition ${
                  selected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50"
                }`}
              >
                <p className="text-sm font-semibold">{m.label}</p>
                <p
                  className={`mt-0.5 text-xs ${selected ? "text-blue-100" : "text-slate-400"}`}
                >
                  {m.hint}
                  {m.value === "exam" ? `（${examWrongCount}問）` : ""}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {settings.mode === "terms" ? (
        <>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-blue-50 p-3 text-center text-xs">
            <div>
              <p className="text-lg font-bold text-rose-600">{incorrectCount}</p>
              <p className="text-slate-500">不正解</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600">{uncertainCount}</p>
              <p className="text-slate-500">あやふや</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">{allCount}</p>
              <p className="text-slate-500">合計</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              出題対象
            </label>
            <div className="space-y-2">
              {FILTERS.map((f) => {
                const selected = settings.filter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => onChange({ ...settings, filter: f.value })}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                      selected
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{f.label}</p>
                      <p
                        className={`text-xs ${selected ? "text-blue-100" : "text-slate-400"}`}
                      >
                        {f.hint}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <QuestionCountSelector
            countOption={settings.countOption}
            customCount={settings.customCount}
            maxCount={Math.max(1, allCount)}
            onCountOptionChange={(countOption: QuestionCountOption) =>
              onChange({ ...settings, countOption })
            }
            onCustomCountChange={(customCount: number) =>
              onChange({ ...settings, customCount })
            }
          />
        </>
      ) : (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-100">
          テストで間違えた問題を、同じ形式（PDF＋マーク）で復習します。正解すると復習リストから外れます。
        </p>
      )}

      <button
        type="button"
        onClick={onStart}
        disabled={poolSize === 0}
        className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none"
      >
        スタート（{poolSize}問）
      </button>
    </div>
  );
}
