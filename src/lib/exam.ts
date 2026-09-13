import raw from "@/data/kawai_common_test_vol1.json";
import { resolveQuestionCount } from "@/lib/quiz";
import type {
  ExamQuestion,
  ExamSectionInfo,
  QuestionCountOption,
} from "@/lib/types";

const MARK_DIGITS = ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"] as const;

type Choice = { id: number; text: string };

type SubQuestion = {
  target_label?: string;
  prompt?: string;
  choices?: Choice[];
  correct_choice_id?: number;
  correct_value?: number;
  correct_values?: Record<string, number>;
  answers?: Record<string, number>;
  explanation?: string;
};

type RawQuestion = {
  question_id: string;
  sub_id?: string;
  topic?: string;
  question_text?: string;
  context?: string;
  figure?: { description?: string };
  figure_sequence_diagram?: { mermaid_code?: string };
  table_data?: { columns?: string[]; rows?: unknown[][] };
  code_snippet?: string;
  choices?: Choice[];
  target_label?: string;
  correct_choice_id?: number;
  correct_choice_ids?: number[];
  answers?: Record<string, number>;
  answer_details?: Record<string, string>;
  explanation?: string;
  sub_questions?: SubQuestion[];
};

type RawSection = {
  section_id: string;
  section_title: string;
  score?: number;
  questions: RawQuestion[];
};

type RawExam = {
  metadata?: { source?: string };
  sections: RawSection[];
};

const data = raw as RawExam;

function markChoices(maxId: number): string[] {
  const max = Math.max(0, Math.min(9, maxId));
  return Array.from({ length: max + 1 }, (_, i) => MARK_DIGITS[i] ?? String(i));
}

function choiceTexts(choices: Choice[]): string[] {
  const sorted = [...choices].sort((a, b) => a.id - b.id);
  return sorted.map((c) => `${MARK_DIGITS[c.id] ?? c.id} ${c.text}`);
}

function maxAnswerValue(values: number[]): number {
  return Math.max(3, ...values, 0);
}

function figureText(q: RawQuestion): string | undefined {
  const parts: string[] = [];
  if (q.figure?.description) parts.push(q.figure.description);
  if (q.figure_sequence_diagram?.mermaid_code) {
    parts.push("【シーケンス図の流れ】\n" + q.figure_sequence_diagram.mermaid_code);
  }
  if (q.table_data?.columns && q.table_data.rows) {
    const header = q.table_data.columns.join(" | ");
    const rows = q.table_data.rows
      .slice(0, 5)
      .map((r) => r.join(" | "))
      .join("\n");
    const more =
      q.table_data.rows.length > 5
        ? `\n…他 ${q.table_data.rows.length - 5} 行`
        : "";
    parts.push(`【表】\n${header}\n${rows}${more}`);
  }
  if (q.code_snippet) {
    parts.push("【プログラム】\n" + q.code_snippet);
  }
  return parts.length ? parts.join("\n\n") : undefined;
}

function pushItem(
  list: ExamQuestion[],
  item: Omit<ExamQuestion, "category"> & { category?: string },
) {
  list.push({
    ...item,
    category: item.category ?? item.sectionTitle,
  });
}

function flattenSub(
  list: ExamQuestion[],
  section: RawSection,
  q: RawQuestion,
  sub: SubQuestion,
  index: number,
) {
  const baseId = `${q.question_id}-${sub.target_label ?? index}`;
  const titleParts = [
    q.sub_id,
    sub.target_label ? `[${sub.target_label}]` : null,
    q.topic,
  ].filter(Boolean);
  const stem =
    [q.question_text, sub.prompt].filter(Boolean).join("\n\n") ||
    q.topic ||
    "問題";

  const shared = {
    sectionId: section.section_id,
    sectionTitle: section.section_title,
    topic: q.topic,
    subId: q.sub_id,
    targetLabel: sub.target_label,
    question: titleParts.length
      ? `${titleParts.join(" / ")}\n\n${stem}`
      : stem,
    context: q.context,
    figure: figureText(q),
    explanation: sub.explanation ?? q.explanation,
  };

  if (sub.choices && sub.correct_choice_id != null) {
    pushItem(list, {
      id: baseId,
      ...shared,
      choices: choiceTexts(sub.choices),
      answerIndex: sub.correct_choice_id,
    });
    return;
  }

  if (sub.answers) {
    for (const [label, value] of Object.entries(sub.answers)) {
      pushItem(list, {
        id: `${baseId}-${label}`,
        ...shared,
        targetLabel: label,
        question: `${shared.question}\n\n空欄［${label}］に入る番号を選べ。`,
        choices: markChoices(maxAnswerValue(Object.values(sub.answers))),
        answerIndex: value,
        explanation: sub.explanation ?? q.explanation,
      });
    }
    return;
  }

  if (sub.correct_values) {
    for (const [label, value] of Object.entries(sub.correct_values)) {
      pushItem(list, {
        id: `${baseId}-${label}`,
        ...shared,
        targetLabel: label,
        question: `${shared.question}\n\n空欄［${label}］に入る番号を選べ。`,
        choices: markChoices(maxAnswerValue(Object.values(sub.correct_values))),
        answerIndex: value,
        explanation: sub.explanation ?? q.explanation,
      });
    }
    return;
  }

  if (sub.correct_value != null) {
    pushItem(list, {
      id: baseId,
      ...shared,
      question: `${shared.question}\n\nマークシートに記入する番号を選べ。`,
      choices: markChoices(maxAnswerValue([sub.correct_value])),
      answerIndex: sub.correct_value,
    });
  }
}

function flattenQuestion(
  list: ExamQuestion[],
  section: RawSection,
  q: RawQuestion,
) {
  const sharedBase = {
    sectionId: section.section_id,
    sectionTitle: section.section_title,
    topic: q.topic,
    subId: q.sub_id,
    context: q.context,
    figure: figureText(q),
    explanation: q.explanation,
  };

  if (q.choices && q.correct_choice_id != null) {
    const heading = [q.sub_id, q.topic].filter(Boolean).join(" / ");
    pushItem(list, {
      id: q.question_id,
      ...sharedBase,
      targetLabel: q.target_label,
      question: [heading, q.question_text].filter(Boolean).join("\n\n"),
      choices: choiceTexts(q.choices),
      answerIndex: q.correct_choice_id,
    });
    return;
  }

  if (q.sub_questions?.length) {
    q.sub_questions.forEach((sub, i) => flattenSub(list, section, q, sub, i));
    return;
  }

  if (q.answers) {
    const heading = [q.sub_id, q.topic].filter(Boolean).join(" / ");
    const details = q.answer_details;
    for (const [label, value] of Object.entries(q.answers)) {
      const detail = details?.[label];
      pushItem(list, {
        id: `${q.question_id}-${label}`,
        ...sharedBase,
        targetLabel: label,
        question: [heading, q.question_text, `空欄［${label}］に入る番号を選べ。`]
          .filter(Boolean)
          .join("\n\n"),
        choices: markChoices(maxAnswerValue(Object.values(q.answers))),
        answerIndex: value,
        explanation: [detail ? `正解の内容: ${detail}` : null, q.explanation]
          .filter(Boolean)
          .join("\n"),
      });
    }
    return;
  }

  if (q.correct_choice_ids?.length) {
    const heading = [q.sub_id, q.topic].filter(Boolean).join(" / ");
    const max = maxAnswerValue(q.correct_choice_ids);
    pushItem(list, {
      id: q.question_id,
      ...sharedBase,
      question: [
        heading,
        q.question_text ?? "正しいものをすべて選べ。",
        "当てはまる番号をすべて選んでください（複数選択）。",
      ]
        .filter(Boolean)
        .join("\n\n"),
      choices: markChoices(max),
      answerIndex: q.correct_choice_ids[0],
      answerIndexes: q.correct_choice_ids,
      multiSelect: true,
      explanation: q.explanation,
    });
    return;
  }

  if (q.correct_choice_id != null) {
    const heading = [q.sub_id, q.topic].filter(Boolean).join(" / ");
    pushItem(list, {
      id: q.question_id,
      ...sharedBase,
      question: [
        heading,
        q.question_text ?? q.topic ?? "問題",
        "マークシートに記入する番号を選べ。",
      ]
        .filter(Boolean)
        .join("\n\n"),
      choices: markChoices(9),
      answerIndex: q.correct_choice_id,
      explanation: q.explanation,
    });
  }
}

function buildQuestions(): ExamQuestion[] {
  const list: ExamQuestion[] = [];
  for (const section of data.sections) {
    for (const q of section.questions) {
      flattenQuestion(list, section, q);
    }
  }
  return list;
}

const questions = buildQuestions();

export function getExamSourceLabel(): string {
  return data.metadata?.source ?? "共通テスト対策問題";
}

export function getAllExamQuestions(): ExamQuestion[] {
  return questions;
}

export function getExamSections(): ExamSectionInfo[] {
  return data.sections.map((s) => ({
    id: s.section_id,
    title: s.section_title,
    score: s.score,
    count: questions.filter((q) => q.sectionId === s.section_id).length,
  }));
}

export function getExamCategoryCounts(
  all: ExamQuestion[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of all) {
    counts[q.sectionId] = (counts[q.sectionId] ?? 0) + 1;
  }
  return counts;
}

export function buildExamDeck(
  all: ExamQuestion[],
  sectionId: string,
  countOption: QuestionCountOption,
  customCount: number,
): ExamQuestion[] {
  const filtered =
    sectionId === "all"
      ? all
      : all.filter((q) => q.sectionId === sectionId);
  const count = resolveQuestionCount(filtered.length, countOption, customCount);
  // 本番順を保つ（シャッフルしない）
  return filtered.slice(0, count);
}
