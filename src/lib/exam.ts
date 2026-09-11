import rawQuestions from "@/data/exam_questions.json";
import { resolveQuestionCount } from "@/lib/quiz";
import type {
  ExamQuestion,
  QuestionCountOption,
} from "@/lib/types";

type RawExamQuestion = {
  id?: string;
  category: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
};

const questions: ExamQuestion[] = (rawQuestions as RawExamQuestion[]).map(
  (item, index) => ({
    id: item.id ?? `exam-${index + 1}`,
    category: item.category,
    question: item.question,
    choices: item.choices,
    answerIndex: item.answerIndex,
    explanation: item.explanation,
  }),
);

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getAllExamQuestions(): ExamQuestion[] {
  return questions;
}

export function getExamCategories(): string[] {
  return [...new Set(questions.map((q) => q.category))];
}

export function buildExamDeck(
  all: ExamQuestion[],
  category: string,
  countOption: QuestionCountOption,
  customCount: number,
): ExamQuestion[] {
  const filtered =
    category === "all" ? all : all.filter((q) => q.category === category);
  const count = resolveQuestionCount(filtered.length, countOption, customCount);
  return shuffle(filtered).slice(0, count);
}

export function getExamCategoryCounts(
  all: ExamQuestion[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of all) {
    counts[q.category] = (counts[q.category] ?? 0) + 1;
  }
  return counts;
}

