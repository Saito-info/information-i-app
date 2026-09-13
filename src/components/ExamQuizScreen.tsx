"use client";

import type {
  ExamQuestion,
  ExamResults,
  ExamReviewMode,
  ExamSessionMeta,
} from "@/lib/types";
import { useMemo, useState } from "react";

type AnswerValue = {
  single: number | null;
  multi: number[];
};

type ExamQuizScreenProps = {
  questions: ExamQuestion[];
  meta: ExamSessionMeta;
  onFinish: (results: ExamResults) => void;
  onExit: () => void;
};

type Phase = "answer" | "review";

export function ExamQuizScreen({
  questions,
  meta,
  onFinish,
  onExit,
}: ExamQuizScreenProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [phase, setPhase] = useState<Phase>("answer");
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [interrupted, setInterrupted] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(true);

  const reviewMode: ExamReviewMode = meta.reviewMode;
  const current = questions[index];

  const sectionBounds = useMemo(
    () => buildSectionBounds(questions),
    [questions],
  );

  const currentBound = useMemo(() => {
    if (!current) return null;
    return (
      sectionBounds.find(
        (b) => index >= b.start && index <= b.end,
      ) ?? null
    );
  }, [current, index, sectionBounds]);

  if (!questions.length) {
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

  function getAnswer(q: ExamQuestion): AnswerValue {
    return answers[q.id] ?? { single: null, multi: [] };
  }

  function setSingle(q: ExamQuestion, value: number) {
    setAnswers((prev) => ({
      ...prev,
      [q.id]: { single: value, multi: [] },
    }));
  }

  function toggleMulti(q: ExamQuestion, choiceIndex: number) {
    setAnswers((prev) => {
      const cur = prev[q.id] ?? { single: null, multi: [] };
      const multi = cur.multi.includes(choiceIndex)
        ? cur.multi.filter((x) => x !== choiceIndex)
        : [...cur.multi, choiceIndex].sort((a, b) => a - b);
      return { ...prev, [q.id]: { single: null, multi } };
    });
  }

  function isAnswered(q: ExamQuestion): boolean {
    const a = getAnswer(q);
    return q.multiSelect ? a.multi.length > 0 : a.single !== null;
  }

  function scoreQuestions(ids: string[]) {
    let correct = 0;
    let incorrect = 0;
    let selfGradeCount = 0;
    let total = 0;

    for (const id of ids) {
      const q = questions.find((item) => item.id === id);
      if (!q || !isAnswered(q)) continue;
      total += 1;
      if (q.selfGradeOnly) {
        selfGradeCount += 1;
        continue;
      }
      if (isCorrectAnswer(q, getAnswer(q))) correct += 1;
      else incorrect += 1;
    }

    return { correct, incorrect, total, selfGradeCount };
  }

  function finishWithIds(ids: string[], wasInterrupted: boolean) {
    const scored = scoreQuestions(ids);
    onFinish({
      ...scored,
      interrupted: wasInterrupted,
    });
  }

  function openReview(ids: string[], wasInterrupted = false) {
    setInterrupted(wasInterrupted);
    setReviewIds(ids);
    setPhase("review");
  }

  function handleNext() {
    if (!current || !isAnswered(current)) return;

    const isLastOverall = index >= questions.length - 1;
    const isLastInSection = currentBound ? index === currentBound.end : false;

    if (isLastOverall) {
      openReview(questions.map((q) => q.id));
      return;
    }

    if (isLastInSection && reviewMode === "per-section" && currentBound) {
      const ids = questions
        .slice(currentBound.start, currentBound.end + 1)
        .map((q) => q.id);
      openReview(ids);
      return;
    }

    setIndex((i) => i + 1);
    setPagesOpen(true);
  }

  function handleContinueAfterReview() {
    if (interrupted) {
      finishWithIds(reviewIds, true);
      return;
    }

    const lastReviewIndex = Math.max(
      ...reviewIds.map((id) => questions.findIndex((q) => q.id === id)),
    );

    if (lastReviewIndex >= questions.length - 1) {
      finishWithIds(questions.map((q) => q.id), false);
      return;
    }

    setPhase("answer");
    setReviewIds([]);
    setIndex(lastReviewIndex + 1);
    setPagesOpen(true);
  }

  function handleInterrupt() {
    const answeredIds = questions
      .slice(0, index + 1)
      .filter((q) => isAnswered(q))
      .map((q) => q.id);

    if (answeredIds.length === 0) {
      onExit();
      return;
    }

    const ok = window.confirm(
      "ここまでで採点・解答確認しますか？\n（未解答の問題は採点対象外です）",
    );
    if (!ok) return;
    openReview(answeredIds, true);
  }

  if (phase === "review") {
    const reviewQuestions = reviewIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is ExamQuestion => Boolean(q));
    const scored = scoreQuestions(reviewIds);
    const lastReviewIndex = Math.max(
      ...reviewIds.map((id) => questions.findIndex((q) => q.id === id)),
      -1,
    );
    const hasMore = !interrupted && lastReviewIndex < questions.length - 1;
    const sectionLabel =
      reviewQuestions[0]?.sectionTitle ??
      (interrupted ? "ここまでの解答" : "解答確認");

    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-6 pt-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700">
            {interrupted ? "中断・採点" : "解答確認"}
          </p>
          <p className="text-xs text-slate-500">{meta.sourceTitle}</p>
        </div>

        <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-100">
          <p className="text-base font-bold text-slate-800">{sectionLabel}</p>
          <p className="mt-1 text-sm text-slate-500">
            採点対象 {scored.total}問 / 正解 {scored.correct}
            {scored.selfGradeCount
              ? ` / 自己確認 ${scored.selfGradeCount}`
              : ""}
          </p>
        </div>

        <div className="space-y-4">
          {reviewQuestions.map((q, i) => (
            <ReviewCard
              key={q.id}
              index={i + 1}
              question={q}
              answer={getAnswer(q)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleContinueAfterReview}
          className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
        >
          {interrupted
            ? "結果を見る"
            : hasMore
              ? "次の大問へ"
              : "結果を見る"}
        </button>
      </div>
    );
  }

  if (!current || !currentBound) {
    return null;
  }

  const answer = getAnswer(current);
  const multi = Boolean(current.multiSelect);
  const canGoNext = isAnswered(current);
  const isLastInSection = index === currentBound.end;
  const isLastOverall = index >= questions.length - 1;
  const progress = ((index + 1) / questions.length) * 100;
  const localIndex = index - currentBound.start + 1;
  const localTotal = currentBound.end - currentBound.start + 1;

  let nextLabel = "次の設問へ";
  if (isLastOverall) {
    nextLabel = "解答を確認する";
  } else if (isLastInSection && reviewMode === "per-section") {
    nextLabel = `${current.sectionTitle}の解答を確認`;
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-4 pt-2">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleInterrupt}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          ← 中断して採点
        </button>
        <p className="text-right text-xs font-medium text-slate-500">
          {meta.sourceTitle}
        </p>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>
            {current.sectionTitle}（{localIndex}/{localTotal}）
          </span>
          <span className="text-xs font-medium text-slate-400">
            全体 {index + 1}/{questions.length}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-blue-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {current.pageImages?.length ? (
        <div className="rounded-2xl bg-white ring-1 ring-slate-100">
          <button
            type="button"
            onClick={() => setPagesOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-slate-800">
              問題冊子（{current.sectionTitle}のPDFページ）
            </span>
            <span className="text-xs text-blue-600">
              {pagesOpen ? "閉じる" : "開く"}
            </span>
          </button>
          {pagesOpen ? (
            <div className="max-h-80 space-y-2 overflow-y-auto border-t border-slate-100 px-3 py-3">
              {current.pageImages.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={`${current.sectionTitle}の問題ページ`}
                  className="w-full rounded-lg border border-slate-200 bg-white object-contain"
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-slate-100">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-600">
            {current.sourceTitle}
          </span>
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
            {current.sectionTitle}
          </span>
          {current.targetLabel ? (
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
              [{current.targetLabel}]
            </span>
          ) : null}
          {multi ? (
            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-700">
              複数選択
            </span>
          ) : null}
          {current.selfGradeOnly ? (
            <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-medium text-violet-700">
              自己採点
            </span>
          ) : null}
        </div>

        {(current.context || current.figure || current.figureImages?.length) && (
          <div className="mb-4 space-y-3">
            <p className="text-xs font-semibold tracking-wide text-blue-600">
              共通の問題文・資料
            </p>
            {current.context ? (
              <div className="max-h-56 overflow-y-auto rounded-xl bg-slate-50 px-3 py-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {current.context}
              </div>
            ) : null}
            {current.figure ? (
              <div className="max-h-64 overflow-auto rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-3 py-3 text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">
                {current.figure}
              </div>
            ) : null}
            {current.figureImages?.length ? (
              <div className="space-y-2">
                {current.figureImages.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt="問題の図"
                    className="w-full rounded-xl border border-slate-200 bg-white object-contain"
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}

        <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500">
          設問
        </p>
        <p className="whitespace-pre-wrap text-base font-semibold leading-relaxed text-slate-800">
          {current.question}
        </p>
        <p className="mt-3 text-xs text-slate-400">
          ※ 各大問が終わるまで正誤は表示されません
        </p>
      </div>

      <div className="space-y-2">
        {current.choices.map((label, choiceIndex) => {
          const isSelected = multi
            ? answer.multi.includes(choiceIndex)
            : answer.single === choiceIndex;

          return (
            <button
              key={choiceIndex}
              type="button"
              onClick={() =>
                multi
                  ? toggleMulti(current, choiceIndex)
                  : setSingle(current, choiceIndex)
              }
              className={`flex w-full items-start gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition ${
                isSelected
                  ? "bg-blue-600 text-white ring-1 ring-blue-600"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50"
              }`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-bold">
                {markDigit(choiceIndex)}
              </span>
              <span className="leading-relaxed">{stripLeadingMark(label)}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!canGoNext}
        className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function ReviewCard({
  index,
  question,
  answer,
}: {
  index: number;
  question: ExamQuestion;
  answer: AnswerValue;
}) {
  const answered = question.multiSelect
    ? answer.multi.length > 0
    : answer.single !== null;
  const ok = answered && isCorrectAnswer(question, answer);

  return (
    <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-100">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500">設問 {index}</span>
        {question.selfGradeOnly ? (
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
            PDFで自己確認
          </span>
        ) : !answered ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            未解答
          </span>
        ) : ok ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            正解
          </span>
        ) : (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">
            不正解
          </span>
        )}
      </div>
      <p className="whitespace-pre-wrap text-sm font-semibold text-slate-800">
        {question.question}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        あなたの解答:{" "}
        {question.multiSelect
          ? answer.multi.map(markDigit).join("・") || "—"
          : answer.single != null
            ? markDigit(answer.single)
            : "—"}
      </p>
      {!question.selfGradeOnly ? (
        <p className="mt-1 text-xs text-slate-500">
          正解:{" "}
          {(question.answerIndexes ?? [question.answerIndex])
            .map(markDigit)
            .join("・")}
        </p>
      ) : (
        <p className="mt-1 text-xs text-violet-700">
          正解データ未収録のため、PDFページで確認してください。
        </p>
      )}
      {question.explanation ? (
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
          {question.explanation}
        </p>
      ) : null}
      {question.pageImages?.length ? (
        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
          {question.pageImages.slice(0, 2).map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt="問題ページ"
              className="w-full rounded-lg border border-slate-200 object-contain"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function buildSectionBounds(questions: ExamQuestion[]) {
  const bounds: Array<{ fieldId: string; start: number; end: number }> = [];
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i]!;
    const last = bounds[bounds.length - 1];
    if (last && last.fieldId === q.fieldId) {
      last.end = i;
    } else {
      bounds.push({ fieldId: q.fieldId, start: i, end: i });
    }
  }
  return bounds;
}

function isCorrectAnswer(q: ExamQuestion, answer: AnswerValue): boolean {
  if (q.multiSelect) {
    return sameSet(answer.multi, q.answerIndexes ?? [q.answerIndex]);
  }
  return answer.single === q.answerIndex;
}

function markDigit(n: number): string {
  return ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][n] ?? String(n);
}

function stripLeadingMark(label: string): string {
  return label.replace(/^[⓪①②③④⑤⑥⑦⑧⑨]\s*/, "");
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}
