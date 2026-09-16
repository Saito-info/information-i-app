export type TermItem = {
  id: string;
  term: string;
  meaning: string;
  category: string;
};

export type AnswerResult = "correct" | "uncertain" | "incorrect";

export type QuestionCountOption = "all" | "5" | "10" | "20" | "custom";

export type ReviewFilter = "all" | "incorrect" | "uncertain";

export type StudySettings = {
  category: string;
  countOption: QuestionCountOption;
  customCount: number;
};

export type ReviewMode = "terms" | "exam";

export type ReviewSettings = {
  mode: ReviewMode;
  filter: ReviewFilter;
  countOption: QuestionCountOption;
  customCount: number;
};

export type QuizResults = {
  correct: number;
  uncertain: number;
  incorrect: number;
  total: number;
};

/** 共通テストの大問（第1〜4問） */
export type ExamFieldId = "1" | "2" | "3" | "4";

/** 出題範囲: 大問1つ or すべて */
export type ExamFieldSelection = ExamFieldId | "all";

export type ExamQuestion = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  fieldId: ExamFieldId;
  sectionTitle: string;
  label?: string;
  markSymbol?: string;
  question: string;
  choices: string[];
  answerIndex: number;
  score?: number;
  explanation?: string;
  pageImages: string[];
  answerPageImages: string[];
};

export type ExamSourceInfo = {
  id: string;
  title: string;
  count: number;
};

export type ExamSettings = {
  /** 受けるテスト（問題集） */
  sourceId: string;
  /** すべて / 第1〜4問 */
  fieldId: ExamFieldSelection;
};

export type ExamSessionMeta = {
  sourceId: string;
  sourceTitle: string;
  fieldId: ExamFieldSelection;
  answerPageImages: string[];
};

export type ExamResults = {
  correct: number;
  incorrect: number;
  total: number;
  scoreEarned: number;
  scoreMax: number;
  interrupted?: boolean;
  wrongIds: string[];
  /** 解答済みかつ正解の設問ID */
  correctIds: string[];
  /** 設問ID → 選択したマーク番号 */
  answers: Record<string, number>;
};

export type StudyHistoryEntry = {
  id: string;
  kind: "study" | "review-terms";
  at: string;
  title: string;
  correct: number;
  uncertain: number;
  incorrect: number;
  total: number;
};

export type ExamHistoryEntry = {
  id: string;
  kind: "exam" | "review-exam";
  at: string;
  title: string;
  sourceId: string;
  sourceTitle: string;
  fieldId: ExamFieldSelection;
  correct: number;
  incorrect: number;
  total: number;
  scoreEarned: number;
  scoreMax: number;
  interrupted?: boolean;
  wrongIds: string[];
};

export type HistoryEntry = StudyHistoryEntry | ExamHistoryEntry;

export type AppTab = "study" | "exam" | "review" | "terms" | "history";
