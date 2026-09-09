"use client";

import { FlashCard } from "@/components/FlashCard";
import type { AnswerResult, QuizResults, TermItem } from "@/lib/types";
import {
  markCorrect,
  markIncorrect,
  markUncertain,
} from "@/lib/storage";
import { useEffect, useRef, useState } from "react";

/** FlashCard の CSS transition（duration-500）と揃える */
const FLIP_MS = 500;

type QuizScreenProps = {
  deck: TermItem[];
  onFinish: (results: QuizResults) => void;
  onExit: () => void;
};

export function QuizScreen({ deck, onFinish, onExit }: QuizScreenProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [results, setResults] = useState<QuizResults>({
    correct: 0,
    uncertain: 0,
    incorrect: 0,
    total: deck.length,
  });

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const current = deck[index];
  const progress = ((index + 1) / deck.length) * 100;

  function handleAnswer(result: AnswerResult) {
    if (!current || advancing) return;

    if (result === "incorrect") markIncorrect(current.id);
    else if (result === "uncertain") markUncertain(current.id);
    else markCorrect(current.id);

    const key =
      result === "correct"
        ? "correct"
        : result === "uncertain"
          ? "uncertain"
          : "incorrect";

    const nextResults: QuizResults = {
      ...results,
      [key]: results[key] + 1,
    };

    setResults(nextResults);

    if (index + 1 >= deck.length) {
      onFinish(nextResults);
      return;
    }

    // 1) まず裏→表にめくる（この間はまだ現在の問題のまま）
    setAdvancing(true);
    setFlipped(false);

    // 2) 真横（見えない瞬間）で次の問題の「表（用語）」に差し替え
    const swapTimer = setTimeout(() => {
      setIndex((i) => i + 1);
    }, FLIP_MS / 2);

    // 3) めくり完了後に操作を再開
    const doneTimer = setTimeout(() => {
      setAdvancing(false);
    }, FLIP_MS);

    timersRef.current = [swapTimer, doneTimer];
  }

  if (!current) {
    return (
      <div className="px-4 py-8 text-center text-slate-500">
        出題できる問題がありません。
        <button
          type="button"
          onClick={onExit}
          className="mt-4 block w-full rounded-xl bg-blue-600 py-3 font-semibold text-white"
        >
          設定に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-4 pt-2">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          disabled={advancing}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-40"
        >
          ← 中断
        </button>
        <p className="text-sm font-semibold text-slate-700">
          {index + 1}問目 / 全{deck.length}問
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <FlashCard
        item={current}
        flipped={flipped}
        disabled={advancing}
        onFlip={() => {
          if (!advancing) setFlipped(true);
        }}
      />

      {flipped && !advancing ? (
        <div className="grid grid-cols-3 gap-2">
          <AnswerButton
            label="不正解"
            tone="incorrect"
            onClick={() => handleAnswer("incorrect")}
          />
          <AnswerButton
            label="あやふや"
            tone="uncertain"
            onClick={() => handleAnswer("uncertain")}
          />
          <AnswerButton
            label="正解"
            tone="correct"
            onClick={() => handleAnswer("correct")}
          />
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-slate-400">
          {advancing
            ? "次の問題へ…"
            : "答えを思い浮かべてからカードをタップ"}
        </p>
      )}
    </div>
  );
}

function AnswerButton({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "incorrect" | "uncertain" | "correct";
  onClick: () => void;
}) {
  const styles = {
    incorrect: "bg-rose-500 hover:bg-rose-600 text-white",
    uncertain: "bg-amber-400 hover:bg-amber-500 text-slate-900",
    correct: "bg-emerald-500 hover:bg-emerald-600 text-white",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl py-3.5 text-sm font-bold shadow-sm transition active:scale-[0.98] ${styles}`}
    >
      {label}
    </button>
  );
}
