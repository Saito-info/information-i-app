"use client";

import { QuestionCountSelector } from "@/components/QuestionCountSelector";
import type { LearningRecord } from "@/lib/storage";
import type {
  QuestionCountOption,
  ReviewFilter,
  ReviewSettings,
} from "@/lib/types";

type ReviewSetupProps = {
  settings: ReviewSettings;
  record: LearningRecord;
  poolSize: number;
  onChange: (settings: ReviewSettings) => void;
  onStart: () => void;
};

const FILTERS: { value: ReviewFilter; label: string; hint: string }[] = [
  { value: "all", label: "すべて", hint: "不正解＋あやふや" },
  { value: "incorrect", label: "不正解のみ", hint: "苦手な用語" },
  { value: "uncertain", label: "あやふやのみ", hint: "もう一度確認" },
];

export function ReviewSetup({
  settings,
  record,
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
          記録した苦手・あやふやな用語を復習できます。
        </p>
      </header>

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
                <span className="text-sm font-semibold">{f.label}</span>
                <span
                  className={`text-xs ${selected ? "text-blue-100" : "text-slate-400"}`}
                >
                  {f.hint}
                </span>
              </button>
            );
          })}
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

      {poolSize === 0 ? (
        <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-500">
          復習対象の用語がありません。学習タブで問題に取り組んでください。
        </p>
      ) : null}

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
