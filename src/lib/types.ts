export type TermItem = {
  id: string;
  term: string;
  meaning: string;
  category: string;
};

export type AnswerResult = "correct" | "uncertain" | "incorrect";

export type QuizMode = "study" | "review";

export type QuestionCountOption = "all" | "5" | "10" | "20" | "custom";

export type ReviewFilter = "all" | "incorrect" | "uncertain";

export type StudySettings = {
  category: string;
  countOption: QuestionCountOption;
  customCount: number;
};

export type ReviewSettings = {
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

export type ExamQuestion = {
  id: string;
  /** 大問ID（section_1 など） */
  sectionId: string;
  /** 大問タイトル */
  sectionTitle: string;
  /** 表示用カテゴリ（大問名） */
  category: string;
  topic?: string;
  subId?: string;
  targetLabel?: string;
  question: string;
  context?: string;
  figure?: string;
  choices: string[];
  /** 単一正解（マークシート番号） */
  answerIndex: number;
  /** 複数正解（複数選択問題） */
  answerIndexes?: number[];
  multiSelect?: boolean;
  explanation?: string;
};

export type ExamSectionInfo = {
  id: string;
  title: string;
  score?: number;
  count: number;
};

export type ExamSettings = {
  /** "all" または sectionId */
  sectionId: string;
  countOption: QuestionCountOption;
  customCount: number;
};

export type ExamResults = {
  correct: number;
  incorrect: number;
  total: number;
};

export type AppTab = "study" | "review" | "exam" | "terms";
