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

/** 共通テストの大問（第1〜4問） */
export type ExamFieldId = "1" | "2" | "3" | "4";

/** 出題範囲: 大問1つ or すべて */
export type ExamFieldSelection = ExamFieldId | "all";

/**
 * すべて選択時の解答確認タイミング
 * - per-section: 各大問の終わりに確認
 * - at-end: 全問終了後にまとめて確認
 */
export type ExamReviewMode = "per-section" | "at-end";

export type ExamQuestion = {
  id: string;
  /** 問題集ソースID */
  sourceId: string;
  /** 問題集名 */
  sourceTitle: string;
  /** 大問番号（1〜4） */
  fieldId: ExamFieldId;
  /** 大問ID（元データ） */
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
  /** 図画像のURL（/exam-figures/...） */
  figureImages?: string[];
  /** 該当大問のPDFページ画像 */
  pageImages?: string[];
  choices: string[];
  answerIndex: number;
  answerIndexes?: number[];
  multiSelect?: boolean;
  explanation?: string;
  /** true のとき自動採点せず、PDFで自己確認 */
  selfGradeOnly?: boolean;
};

export type ExamSourceInfo = {
  id: string;
  title: string;
  count: number;
};

export type ExamFieldInfo = {
  id: ExamFieldSelection;
  title: string;
  /** その分野を持つソース数（すべてならソース総数） */
  sourceCount: number;
};

/** @deprecated 互換用 */
export type ExamSectionInfo = {
  id: string;
  title: string;
  score?: number;
  count: number;
};

export type ExamSettings = {
  fieldId: ExamFieldSelection;
  /** 「すべて」のときのみ有効 */
  reviewMode: ExamReviewMode;
};

export type ExamSessionMeta = {
  sourceId: string;
  sourceTitle: string;
  fieldId: ExamFieldSelection;
  reviewMode: ExamReviewMode;
};

export type ExamResults = {
  correct: number;
  incorrect: number;
  total: number;
  /** 途中終了かどうか */
  interrupted?: boolean;
  /** 自己採点のみの設問数 */
  selfGradeCount?: number;
};

export type AppTab = "study" | "review" | "exam" | "terms";
