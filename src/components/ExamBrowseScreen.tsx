"use client";

import { PdfPageViewer } from "@/components/PdfPageViewer";
import type { ExamSourceBrowseInfo } from "@/lib/types";
import { useState } from "react";

type ExamBrowseScreenProps = {
  source: ExamSourceBrowseInfo;
  onBack: () => void;
};

type PdfMode = "answer" | "explanation";

export function ExamBrowseScreen({ source, onBack }: ExamBrowseScreenProps) {
  const images = source.answerPageImages;
  const explIdx = source.explanationStartIndex;
  const hasExplanation =
    images.length > 0 &&
    explIdx != null &&
    explIdx < images.length &&
    (explIdx > 0 || images.length > 1);

  const [mode, setMode] = useState<PdfMode>(
    hasExplanation ? "explanation" : "answer",
  );

  const initialPage =
    mode === "explanation" && explIdx != null ? explIdx : 0;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4 pb-8">
      <header>
        <p className="text-sm font-medium text-blue-600">解答・解説</p>
        <h1 className="mt-1 text-xl font-bold text-slate-800">
          {source.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          問題を解かずに正答表と解説PDFを確認できます
        </p>
      </header>

      {images.length ? (
        <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
          <div className="flex gap-2 px-3 pt-3">
            <button
              type="button"
              onClick={() => setMode("answer")}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                mode === "answer"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              正答表
            </button>
            <button
              type="button"
              onClick={() => setMode("explanation")}
              disabled={!hasExplanation}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                mode === "explanation"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              解説
              {hasExplanation && explIdx != null
                ? `（${explIdx + 1}ページ〜）`
                : ""}
            </button>
          </div>
          {!hasExplanation ? (
            <p className="px-4 pt-2 text-[11px] leading-relaxed text-amber-700">
              この試験の収録PDFには正答表のみがあり、詳細な解説ページは含まれていません。
            </p>
          ) : (
            <p className="px-4 pt-2 text-[11px] leading-relaxed text-slate-500">
              「解説」で解説ページへ移動します。前後は下のボタンで切り替えられます。
            </p>
          )}
          <div className="mt-2 h-[70vh]">
            <PdfPageViewer
              key={`${mode}-${initialPage}`}
              images={images}
              title={mode === "explanation" ? "解説PDF" : "正答表PDF"}
              initialPage={initialPage}
              className="h-full"
            />
          </div>
        </section>
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          解答・解説PDFがありません
        </p>
      )}

      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-2xl bg-slate-800 py-3.5 text-base font-bold text-white"
      >
        テスト設定に戻る
      </button>
    </div>
  );
}
