"use client";

import type {
  ExamFieldSelection,
  ExamSettings,
  ExamSourceInfo,
} from "@/lib/types";

type ExamSetupProps = {
  sources: ExamSourceInfo[];
  settings: ExamSettings;
  onChange: (settings: ExamSettings) => void;
  onStart: () => void;
};

const FIELDS: { id: ExamFieldSelection; title: string; hint: string }[] = [
  { id: "all", title: "すべて", hint: "第1〜4問を通しで出題" },
  { id: "1", title: "第1問", hint: "小問集合など" },
  { id: "2", title: "第2問", hint: "情報デザイン・シミュレーションなど" },
  { id: "3", title: "第3問", hint: "プログラミングなど" },
  { id: "4", title: "第4問", hint: "データ分析など" },
];

export function ExamSetup({
  sources,
  settings,
  onChange,
  onStart,
}: ExamSetupProps) {
  const selectedSource = sources.find((s) => s.id === settings.sourceId);
  const canStart = Boolean(settings.sourceId && selectedSource);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-4">
      <header>
        <p className="text-sm font-medium text-blue-600">テスト</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">出題設定</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          受けるテストを選び、すべてまたは大問単位で出題できます。PDFを見ながらマークで解答します。
        </p>
      </header>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          1. テストを選択
        </label>
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {sources.map((source) => {
            const selected = settings.sourceId === source.id;
            return (
              <button
                key={source.id}
                type="button"
                onClick={() =>
                  onChange({ ...settings, sourceId: source.id })
                }
                className={`w-full rounded-xl px-4 py-3 text-left transition ${
                  selected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50"
                }`}
              >
                <p className="text-sm font-semibold leading-snug">
                  {source.title}
                </p>
                <p
                  className={`mt-0.5 text-xs ${selected ? "text-blue-100" : "text-slate-400"}`}
                >
                  {source.count}問
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          2. 出題範囲
        </label>
        <div className="space-y-2">
          {FIELDS.map((field) => {
            const selected = settings.fieldId === field.id;
            return (
              <button
                key={field.id}
                type="button"
                onClick={() => onChange({ ...settings, fieldId: field.id })}
                className={`w-full rounded-xl px-4 py-3 text-left transition ${
                  selected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50"
                }`}
              >
                <p className="text-sm font-semibold">{field.title}</p>
                <p
                  className={`mt-0.5 text-xs ${selected ? "text-blue-100" : "text-slate-400"}`}
                >
                  {field.hint}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={!canStart}
        className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        {selectedSource
          ? `スタート（${selectedSource.title} / ${
              settings.fieldId === "all"
                ? "すべて"
                : `第${settings.fieldId}問`
            }）`
          : "テストを選択してください"}
      </button>
    </div>
  );
}
