"use client";

import type { TermItem } from "@/lib/types";

type FlashCardProps = {
  item: TermItem;
  flipped: boolean;
  onFlip: () => void;
  disabled?: boolean;
};

export function FlashCard({
  item,
  flipped,
  onFlip,
  disabled = false,
}: FlashCardProps) {
  return (
    <button
      type="button"
      onClick={onFlip}
      disabled={disabled || flipped}
      className="group relative w-full perspective-[1200px] disabled:cursor-default"
      aria-label={flipped ? "カードの表を表示" : "カードをめくって意味を表示"}
    >
      <div
        className={`relative min-h-[280px] w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-8 text-center shadow-lg shadow-blue-100/80 ring-1 ring-blue-100 [backface-visibility:hidden]">
          <p className="mb-3 text-xs font-medium tracking-wide text-blue-500">
            用語
          </p>
          <p className="text-2xl font-bold leading-snug text-slate-800">
            {item.term}
          </p>
          <p className="mt-8 text-xs text-slate-400 group-hover:text-blue-400">
            タップして答えを表示
          </p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex flex-col rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-8 text-left text-white shadow-lg shadow-blue-200/60 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="mb-2 inline-flex w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            {item.category}
          </p>
          <p className="mb-3 text-lg font-bold leading-snug">{item.term}</p>
          <p className="flex-1 text-sm leading-relaxed text-blue-50">
            {item.meaning}
          </p>
        </div>
      </div>
    </button>
  );
}
