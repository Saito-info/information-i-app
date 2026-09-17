"use client";

import { BottomNav } from "@/components/BottomNav";
import { ExamQuizScreen } from "@/components/ExamQuizScreen";
import { ExamResultScreen } from "@/components/ExamResultScreen";
import { ExamSetup } from "@/components/ExamSetup";
import { HistoryScreen } from "@/components/HistoryScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { ReviewSetup } from "@/components/ReviewSetup";
import { StudySetup } from "@/components/StudySetup";
import { TermsList } from "@/components/TermsList";
import {
  buildExamSession,
  getExamQuestionsByIds,
  getFieldLabel,
} from "@/lib/exam";
import { buildReviewDeck, buildStudyDeck } from "@/lib/quiz";
import {
  addExamWrongIds,
  addHistoryEntry,
  clearHistory,
  createExamHistory,
  createStudyHistory,
  deleteHistoryEntry,
  loadExamWrongIds,
  loadHistory,
  loadLearningRecord,
  removeExamWrongId,
  type LearningRecord,
} from "@/lib/storage";
import type {
  AppTab,
  ExamQuestion,
  ExamResults,
  ExamSessionMeta,
  ExamSettings,
  ExamSourceInfo,
  HistoryEntry,
  QuizResults,
  ReviewSettings,
  StudySettings,
  TermItem,
} from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

type Phase = "setup" | "quiz" | "result";

type VocabularyAppProps = {
  terms: TermItem[];
  categories: string[];
  examSources: ExamSourceInfo[];
};

export function VocabularyApp({
  terms,
  categories,
  examSources,
}: VocabularyAppProps) {
  const [tab, setTab] = useState<AppTab>("study");
  const [phase, setPhase] = useState<Phase>("setup");
  const [deck, setDeck] = useState<TermItem[]>([]);
  const [examDeck, setExamDeck] = useState<ExamQuestion[]>([]);
  const [examMeta, setExamMeta] = useState<ExamSessionMeta | null>(null);
  const [examKind, setExamKind] = useState<"exam" | "review-exam">("exam");
  const [results, setResults] = useState<QuizResults | null>(null);
  const [examResults, setExamResults] = useState<ExamResults | null>(null);
  const [record, setRecord] = useState<LearningRecord>({
    incorrectIds: [],
    uncertainIds: [],
  });
  const [examWrongIds, setExamWrongIds] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [studySettings, setStudySettings] = useState<StudySettings>({
    category: "all",
    countOption: "10",
    customCount: 15,
  });

  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({
    mode: "terms",
    filter: "all",
    countOption: "all",
    customCount: 10,
  });

  const [examSettings, setExamSettings] = useState<ExamSettings>({
    sourceId: examSources[0]?.id ?? "",
    fieldId: "all",
  });

  useEffect(() => {
    setRecord(loadLearningRecord());
    setExamWrongIds(loadExamWrongIds());
    setHistory(loadHistory());
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of terms) {
      counts[t.category] = (counts[t.category] ?? 0) + 1;
    }
    return counts;
  }, [terms]);

  const studyPoolSize = useMemo(() => {
    if (studySettings.category === "all") return terms.length;
    return categoryCounts[studySettings.category] ?? 0;
  }, [terms.length, studySettings.category, categoryCounts]);

  const reviewPoolSize = useMemo(() => {
    if (reviewSettings.mode === "exam") return examWrongIds.length;
    if (reviewSettings.filter === "incorrect") return record.incorrectIds.length;
    if (reviewSettings.filter === "uncertain") return record.uncertainIds.length;
    return new Set([...record.incorrectIds, ...record.uncertainIds]).size;
  }, [record, reviewSettings, examWrongIds]);

  function refreshSideData() {
    setRecord(loadLearningRecord());
    setExamWrongIds(loadExamWrongIds());
    setHistory(loadHistory());
  }

  function handleTabChange(next: AppTab) {
    setTab(next);
    setPhase("setup");
    setDeck([]);
    setExamDeck([]);
    setExamMeta(null);
    setResults(null);
    setExamResults(null);
    refreshSideData();
  }

  function startStudy() {
    const nextDeck = buildStudyDeck(
      terms,
      studySettings.category,
      studySettings.countOption,
      studySettings.customCount,
    );
    if (nextDeck.length === 0) return;
    setDeck(nextDeck);
    setResults(null);
    setPhase("quiz");
  }

  function startReview() {
    if (reviewSettings.mode === "exam") {
      const qs = getExamQuestionsByIds(loadExamWrongIds());
      if (!qs.length) return;
      setExamDeck(qs);
      setExamMeta({
        sourceId: "review",
        sourceTitle: "間違えた問題の復習",
        fieldId: qs[0]!.fieldId,
        answerPageImages: qs[0]!.answerPageImages,
        explanationStartIndex: qs[0]!.explanationStartIndex ?? null,
      });
      setExamKind("review-exam");
      setExamResults(null);
      setPhase("quiz");
      return;
    }

    const current = loadLearningRecord();
    setRecord(current);
    const nextDeck = buildReviewDeck(
      terms,
      current,
      reviewSettings.filter,
      reviewSettings.countOption,
      reviewSettings.customCount,
    );
    if (nextDeck.length === 0) return;
    setDeck(nextDeck);
    setResults(null);
    setPhase("quiz");
  }

  function startExam() {
    const session = buildExamSession(examSettings);
    if (!session) return;
    setExamDeck(session.questions);
    setExamMeta(session.meta);
    setExamKind("exam");
    setExamResults(null);
    setPhase("quiz");
  }

  function handleFinish(nextResults: QuizResults) {
    setResults(nextResults);
    setPhase("result");
    const kind = tab === "review" ? "review-terms" : "study";
    addHistoryEntry(
      createStudyHistory({
        kind,
        title:
          kind === "study"
            ? studySettings.category === "all"
              ? "学習（すべて）"
              : `学習（${studySettings.category}）`
            : "用語の復習",
        correct: nextResults.correct,
        uncertain: nextResults.uncertain,
        incorrect: nextResults.incorrect,
        total: nextResults.total,
      }),
    );
    refreshSideData();
  }

  function handleExamFinish(nextResults: ExamResults) {
    if (nextResults.wrongIds.length) {
      addExamWrongIds(nextResults.wrongIds);
    }
    if (examKind === "review-exam") {
      for (const id of nextResults.correctIds) {
        removeExamWrongId(id);
      }
    }

    setExamResults(nextResults);
    setPhase("result");
    if (examMeta) {
      addHistoryEntry(
        createExamHistory({
          kind: examKind,
          title: `${examMeta.sourceTitle} ${getFieldLabel(examMeta.fieldId)}`,
          sourceId: examMeta.sourceId,
          sourceTitle: examMeta.sourceTitle,
          fieldId: examMeta.fieldId,
          correct: nextResults.correct,
          incorrect: nextResults.incorrect,
          total: nextResults.total,
          scoreEarned: nextResults.scoreEarned,
          scoreMax: nextResults.scoreMax,
          interrupted: nextResults.interrupted,
          wrongIds: nextResults.wrongIds,
        }),
      );
    }
    refreshSideData();
  }

  function backToSetup() {
    setPhase("setup");
    setDeck([]);
    setExamDeck([]);
    setExamMeta(null);
    setResults(null);
    setExamResults(null);
    refreshSideData();
  }

  const termsQuiz =
    phase === "quiz" &&
    (tab === "study" ||
      (tab === "review" && reviewSettings.mode === "terms"));

  const examQuiz =
    phase === "quiz" &&
    examMeta != null &&
    (tab === "exam" ||
      (tab === "review" && reviewSettings.mode === "exam"));

  const inSession = termsQuiz || examQuiz;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-50 via-slate-50 to-white text-slate-800">
      <div className="mx-auto min-h-dvh max-w-lg pb-24">
        {!examQuiz ? (
          <div className="border-b border-blue-100/80 bg-white/70 px-4 py-3 backdrop-blur">
            <p className="text-center text-sm font-bold tracking-wide text-blue-700">
              情報Ⅰ 単語帳
            </p>
          </div>
        ) : null}

        {phase === "setup" && tab === "study" && (
          <StudySetup
            categoryCounts={categoryCounts}
            totalCount={terms.length}
            settings={studySettings}
            poolSize={studyPoolSize}
            onChange={setStudySettings}
            onStart={startStudy}
          />
        )}

        {phase === "setup" && tab === "exam" && (
          <ExamSetup
            sources={examSources}
            settings={examSettings}
            onChange={setExamSettings}
            onStart={startExam}
          />
        )}

        {phase === "setup" && tab === "review" && (
          <ReviewSetup
            settings={reviewSettings}
            record={record}
            examWrongCount={examWrongIds.length}
            poolSize={reviewPoolSize}
            onChange={setReviewSettings}
            onStart={startReview}
          />
        )}

        {tab === "terms" && <TermsList terms={terms} categories={categories} />}

        {tab === "history" && (
          <HistoryScreen
            entries={history}
            onDelete={(id) => setHistory(deleteHistoryEntry(id))}
            onClear={() => setHistory(clearHistory())}
          />
        )}

        {termsQuiz && (
          <QuizScreen
            key={`${tab}-${deck.map((d) => d.id).join("-")}`}
            deck={deck}
            onFinish={handleFinish}
            onExit={backToSetup}
          />
        )}

        {examQuiz && examMeta && (
          <ExamQuizScreen
            key={examDeck.map((q) => q.id).join("|")}
            questions={examDeck}
            meta={examMeta}
            onFinish={handleExamFinish}
            onExit={backToSetup}
          />
        )}

        {phase === "result" &&
          results &&
          (tab === "study" ||
            (tab === "review" && reviewSettings.mode === "terms")) && (
            <ResultScreen results={results} onBack={backToSetup} />
          )}

        {phase === "result" && examResults && examMeta && (
          <ExamResultScreen
            results={examResults}
            meta={examMeta}
            questions={examDeck}
            onBack={backToSetup}
          />
        )}
      </div>

      {!inSession && (
        <BottomNav activeTab={tab} onChange={handleTabChange} />
      )}
    </div>
  );
}
