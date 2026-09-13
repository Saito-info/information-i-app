"use client";

import { BottomNav } from "@/components/BottomNav";
import { ExamQuizScreen } from "@/components/ExamQuizScreen";
import { ExamResultScreen } from "@/components/ExamResultScreen";
import { ExamSetup } from "@/components/ExamSetup";
import { QuizScreen } from "@/components/QuizScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { ReviewSetup } from "@/components/ReviewSetup";
import { StudySetup } from "@/components/StudySetup";
import { TermsList } from "@/components/TermsList";
import { buildExamDeck } from "@/lib/exam";
import { buildReviewDeck, buildStudyDeck } from "@/lib/quiz";
import {
  loadLearningRecord,
  type LearningRecord,
} from "@/lib/storage";
import type {
  AppTab,
  ExamQuestion,
  ExamResults,
  ExamSectionInfo,
  ExamSettings,
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
  examQuestions: ExamQuestion[];
  examSections: ExamSectionInfo[];
  examSourceLabel: string;
};

export function VocabularyApp({
  terms,
  categories,
  examQuestions,
  examSections,
  examSourceLabel,
}: VocabularyAppProps) {
  const [tab, setTab] = useState<AppTab>("study");
  const [phase, setPhase] = useState<Phase>("setup");
  const [deck, setDeck] = useState<TermItem[]>([]);
  const [examDeck, setExamDeck] = useState<ExamQuestion[]>([]);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [examResults, setExamResults] = useState<ExamResults | null>(null);
  const [record, setRecord] = useState<LearningRecord>({
    incorrectIds: [],
    uncertainIds: [],
  });

  const [studySettings, setStudySettings] = useState<StudySettings>({
    category: "all",
    countOption: "10",
    customCount: 15,
  });

  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({
    filter: "all",
    countOption: "all",
    customCount: 10,
  });

  const [examSettings, setExamSettings] = useState<ExamSettings>({
    sectionId: "all",
    countOption: "all",
    customCount: 10,
  });

  useEffect(() => {
    setRecord(loadLearningRecord());
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
    if (reviewSettings.filter === "incorrect") {
      return record.incorrectIds.length;
    }
    if (reviewSettings.filter === "uncertain") {
      return record.uncertainIds.length;
    }
    return new Set([...record.incorrectIds, ...record.uncertainIds]).size;
  }, [record, reviewSettings.filter]);

  const examPoolSize = useMemo(() => {
    if (examSettings.sectionId === "all") return examQuestions.length;
    return examQuestions.filter((q) => q.sectionId === examSettings.sectionId)
      .length;
  }, [examQuestions, examSettings.sectionId]);

  function refreshRecord() {
    setRecord(loadLearningRecord());
  }

  function handleTabChange(next: AppTab) {
    setTab(next);
    setPhase("setup");
    setDeck([]);
    setExamDeck([]);
    setResults(null);
    setExamResults(null);
    refreshRecord();
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
    const nextDeck = buildExamDeck(
      examQuestions,
      examSettings.sectionId,
      examSettings.countOption,
      examSettings.customCount,
    );
    if (nextDeck.length === 0) return;
    setExamDeck(nextDeck);
    setExamResults(null);
    setPhase("quiz");
  }

  function handleFinish(nextResults: QuizResults) {
    setResults(nextResults);
    setPhase("result");
    refreshRecord();
  }

  function handleExamFinish(nextResults: ExamResults) {
    setExamResults(nextResults);
    setPhase("result");
  }

  function backToSetup() {
    setPhase("setup");
    setDeck([]);
    setExamDeck([]);
    setResults(null);
    setExamResults(null);
    refreshRecord();
  }

  const inSession =
    (tab === "study" || tab === "review") && phase === "quiz"
      ? true
      : tab === "exam" && phase === "quiz";

  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-50 via-slate-50 to-white text-slate-800">
      <div className="mx-auto min-h-dvh max-w-lg pb-24">
        <div className="border-b border-blue-100/80 bg-white/70 px-4 py-3 backdrop-blur">
          <p className="text-center text-sm font-bold tracking-wide text-blue-700">
            情報Ⅰ 単語帳
          </p>
        </div>

        {phase === "setup" && tab === "study" && (
          <StudySetup
            categories={categories}
            categoryCounts={categoryCounts}
            totalCount={terms.length}
            settings={studySettings}
            poolSize={studyPoolSize}
            onChange={setStudySettings}
            onStart={startStudy}
          />
        )}

        {phase === "setup" && tab === "review" && (
          <ReviewSetup
            settings={reviewSettings}
            record={record}
            poolSize={reviewPoolSize}
            onChange={setReviewSettings}
            onStart={startReview}
          />
        )}

        {phase === "setup" && tab === "exam" && (
          <ExamSetup
            sourceLabel={examSourceLabel}
            sections={examSections}
            totalCount={examQuestions.length}
            settings={examSettings}
            poolSize={examPoolSize}
            onChange={setExamSettings}
            onStart={startExam}
          />
        )}

        {tab === "terms" && <TermsList terms={terms} categories={categories} />}

        {phase === "quiz" && (tab === "study" || tab === "review") && (
          <QuizScreen
            key={`${tab}-${deck.map((d) => d.id).join("-")}`}
            deck={deck}
            onFinish={handleFinish}
            onExit={backToSetup}
          />
        )}

        {phase === "quiz" && tab === "exam" && (
          <ExamQuizScreen
            key={examDeck.map((q) => q.id).join("-")}
            questions={examDeck}
            onFinish={handleExamFinish}
            onExit={backToSetup}
          />
        )}

        {phase === "result" &&
          (tab === "study" || tab === "review") &&
          results && (
            <ResultScreen results={results} onBack={backToSetup} />
          )}

        {phase === "result" && tab === "exam" && examResults && (
          <ExamResultScreen results={examResults} onBack={backToSetup} />
        )}
      </div>

      {!inSession && <BottomNav activeTab={tab} onChange={handleTabChange} />}
    </div>
  );
}
