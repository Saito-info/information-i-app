"use client";

import type { ExamFieldId, ExamSettings } from "@/lib/types";

type ExamSetupProps = {
  sourceCount: number;
  settings: ExamSettings;
  onChange: (settings: ExamSettings) => void;
  onStart: () => void;
};

const FIELDS: { id: ExamFieldId; title: string; hint: string }[] = [
  { id: "1", title: "第1問", hint: "小問集合など" },
  { id: "2", title: "第2問", hint: "情報デザイン・シミュレーションなど" },
  { id: "3", title: "第3問", hint: "プログラミングなど" },
  { id: "4", title: "第4問", hint: "データ分析など" },
];

export function ExamSetup({
  sourceCount,
  settings,
  onChange,
  onStart,
}: ExamSetupProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-4">
      <header>
        <p className="text-sm font-medium text-blue-600">テスト</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">出題設定</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          分野（大問）を選ぶと、{sourceCount}
          種類の試験からランダムに1つ選ばれ、その大問が正規順で出題されます。PDFを見ながらマークで解答します。
        </p>
      </header>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          分野を選択
        </label>
        <div className="space-y-2">
          {FIELDS.map((field) => {
            const selected = settings.fieldId === field.id;
            return (
              <button
                key={field.id}
                type="button"
                onClick={() => onChange({ fieldId: field.id })}
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
        className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
      >
        スタート
      </button>
    </div>
  );
}
