"use client";

import type { QuestionCountOption } from "@/lib/types";

type QuestionCountSelectorProps = {
  countOption: QuestionCountOption;
  customCount: number;
  onCountOptionChange: (option: QuestionCountOption) => void;
  onCustomCountChange: (value: number) => void;
  maxCount: number;
};

const OPTIONS: { value: QuestionCountOption; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "5", label: "5問" },
  { value: "10", label: "10問" },
  { value: "20", label: "20問" },
  { value: "custom", label: "任意" },
];

export function QuestionCountSelector({
  countOption,
  customCount,
  onCountOptionChange,
  onCustomCountChange,
  maxCount,
}: QuestionCountSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">出題数</label>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {OPTIONS.map((opt) => {
          const selected = countOption === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onCountOptionChange(opt.value)}
              className={`rounded-xl px-2 py-2.5 text-sm font-medium transition ${
                selected
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {countOption === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={Math.max(1, maxCount)}
            value={customCount}
            onChange={(e) => onCustomCountChange(Number(e.target.value))}
            className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <span className="text-sm text-slate-500">問（最大 {maxCount}）</span>
        </div>
      )}
    </div>
  );
}
