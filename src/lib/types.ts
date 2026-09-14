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

export type ExamSettings = {
  fieldId: ExamFieldId;
};

export type ExamSessionMeta = {
  sourceId: string;
  sourceTitle: string;
  fieldId: ExamFieldId;
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
  fieldId: ExamFieldId;
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
