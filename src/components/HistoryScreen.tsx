"use client";

import type { ExamHistoryEntry, HistoryEntry, StudyHistoryEntry } from "@/lib/types";

type HistoryScreenProps = {
  entries: HistoryEntry[];
  onDelete: (id: string) => void;
  onClear: () => void;
};

export function HistoryScreen({
  entries,
  onDelete,
  onClear,
}: HistoryScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-600">履歴</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">学習・テスト</h1>
          <p className="mt-1 text-sm text-slate-500">
            実施した学習とテストの記録です。
          </p>
        </div>
        {entries.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("履歴をすべて削除しますか？")) onClear();
            }}
            className="shrink-0 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
          >
            全削除
          </button>
        ) : null}
      </header>

      {entries.length === 0 ? (
        <div className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-slate-500 ring-1 ring-slate-100">
          まだ履歴がありません
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                    {kindLabel(entry.kind)}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                    {entry.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(entry.at)}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {summary(entry)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-600"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function kindLabel(kind: HistoryEntry["kind"]): string {
  switch (kind) {
    case "study":
      return "学習";
    case "review-terms":
      return "用語復習";
    case "exam":
      return "テスト";
    case "review-exam":
      return "テスト復習";
  }
}

function summary(entry: HistoryEntry): string {
  if (entry.kind === "exam" || entry.kind === "review-exam") {
    const exam = entry as ExamHistoryEntry;
    return `正解 ${exam.correct}/${exam.total} · 得点 ${exam.scoreEarned}/${exam.scoreMax}${
      exam.interrupted ? " · 中断" : ""
    }`;
  }
  const study = entry as StudyHistoryEntry;
  return `正解 ${study.correct} / あやふや ${study.uncertain} / 不正解 ${study.incorrect}（全${study.total}）`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
