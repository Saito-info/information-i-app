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
  /** テスト分野（ソース）ID */
  sourceId: string;
  /** テスト分野名 */
  sourceTitle: string;
  /** 大問ID */
  sectionId: string;
  /** 大問タイトル */
  sectionTitle: string;
  /** 表示用カテゴリ */
  category: string;
  topic?: string;
  subId?: string;
  targetLabel?: string;
  question: string;
  context?: string;
  figure?: string;
  choices: string[];
  answerIndex: number;
  answerIndexes?: number[];
  multiSelect?: boolean;
  explanation?: string;
};

export type ExamSourceInfo = {
  id: string;
  title: string;
  count: number;
};

/** @deprecated 互換用。分野選択に移行 */
export type ExamSectionInfo = {
  id: string;
  title: string;
  score?: number;
  count: number;
};

export type ExamSettings = {
  /** "all" または sourceId */
  sourceId: string;
};

export type ExamResults = {
  correct: number;
  incorrect: number;
  total: number;
};

export type AppTab = "study" | "review" | "exam" | "terms";
