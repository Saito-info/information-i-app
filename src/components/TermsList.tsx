"use client";

import type { TermItem } from "@/lib/types";
import { useMemo, useState } from "react";

type TermsListProps = {
  terms: TermItem[];
  categories: string[];
};

export function TermsList({ terms, categories }: TermsListProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return terms.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        t.meaning.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [terms, query, category]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4">
      <header>
        <p className="text-sm font-medium text-blue-600">用語リスト</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">用語を探す</h1>
        <p className="mt-1 text-sm text-slate-500">
          用語名・意味で検索できます。タップで意味を表示します。
        </p>
      </header>

      <div className="sticky top-0 z-10 space-y-2 bg-gradient-to-b from-blue-50 via-blue-50/95 to-transparent pb-2 pt-1">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="用語・意味で検索…"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">すべての分野</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400">
          {filtered.length} / {terms.length} 件
        </p>
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
        {filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-slate-400">
            該当する用語がありません
          </li>
        ) : (
          filtered.map((t) => {
            const open = expandedId === t.id;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : t.id)}
                  className="flex w-full flex-col gap-1 px-4 py-3.5 text-left transition hover:bg-blue-50/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-800">{t.term}</span>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                      {t.category}
                    </span>
                  </div>
                  {open ? (
                    <p className="text-sm leading-relaxed text-slate-600">
                      {t.meaning}
                    </p>
                  ) : (
                    <p className="truncate text-xs text-slate-400">
                      タップして意味を表示
                    </p>
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
