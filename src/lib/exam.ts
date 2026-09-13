import raw from "@/data/kawai_common_test_vol1-v2.json";
import { resolveQuestionCount } from "@/lib/quiz";
import type {
  ExamQuestion,
  ExamSectionInfo,
  QuestionCountOption,
} from "@/lib/types";

const MARK_DIGITS = ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"] as const;

type Choice = { id: number; text: string };

type TableData = {
  title?: string;
  columns?: string[];
  rows?: unknown[][];
};

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
  figure_description?: string;
  figure?: { description?: string };
  figure_sequence_diagram?: { type?: string; mermaid_code?: string };
  table_data?: TableData;
  table_1_data?: TableData;
  table_3_1_data?: TableData;
  table_3_2_data?: TableData;
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
  metadata?: { source?: string; version?: string };
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

function formatTable(table: TableData): string | undefined {
  if (!table.columns?.length || !table.rows?.length) return undefined;
  const lines: string[] = [];
  if (table.title) lines.push(table.title);
  lines.push(table.columns.join(" | "));
  lines.push(table.columns.map(() => "---").join(" | "));
  for (const row of table.rows) {
    lines.push(row.map((cell) => String(cell)).join(" | "));
  }
  return lines.join("\n");
}

/** 親問が持つ文・図・表をすべて収集（小問すべてに引き継ぐ） */
function collectSharedMaterials(q: RawQuestion): {
  context?: string;
  figure?: string;
} {
  const contextParts: string[] = [];
  if (q.question_text) contextParts.push(q.question_text);
  if (q.context) contextParts.push(q.context);

  const figureParts: string[] = [];
  if (q.figure_description) {
    figureParts.push(`【図の説明】\n${q.figure_description}`);
  }
  if (q.figure?.description) {
    figureParts.push(`【図の説明】\n${q.figure.description}`);
  }
  if (q.figure_sequence_diagram?.mermaid_code) {
    figureParts.push(
      `【シーケンス図】\n${q.figure_sequence_diagram.mermaid_code}`,
    );
  }

  const tables = [
    q.table_data,
    q.table_1_data,
    q.table_3_1_data,
    q.table_3_2_data,
  ];
  for (const table of tables) {
    if (!table) continue;
    const formatted = formatTable(table);
    if (formatted) figureParts.push(`【表】\n${formatted}`);
  }

  if (q.code_snippet) {
    figureParts.push(`【プログラム】\n${q.code_snippet}`);
  }

  return {
    context: contextParts.length ? contextParts.join("\n\n") : undefined,
    figure: figureParts.length ? figureParts.join("\n\n") : undefined,
  };
}

function normalizeSectionTitle(title: string): string {
  return title.replace("第4问", "第4問");
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

function headingFor(q: RawQuestion, label?: string): string {
  return [q.sub_id, label ? `[${label}]` : null, q.topic]
    .filter(Boolean)
    .join(" / ");
}

function flattenSub(
  list: ExamQuestion[],
  section: RawSection,
  q: RawQuestion,
  sub: SubQuestion,
  index: number,
) {
  const baseId = `${q.question_id}-${sub.target_label ?? index}`;
  const materials = collectSharedMaterials(q);
  const sectionTitle = normalizeSectionTitle(section.section_title);

  const shared = {
    sectionId: section.section_id,
    sectionTitle,
    topic: q.topic,
    subId: q.sub_id,
    targetLabel: sub.target_label,
    // 設問本文はプロンプト中心。共通の文・図は context / figure に載せる
    question: [
      headingFor(q, sub.target_label),
      sub.prompt ?? "次の問いに答えよ。",
    ].join("\n\n"),
    context: materials.context,
    figure: materials.figure,
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
        question: [
          headingFor(q, label),
          sub.prompt,
          `空欄［${label}］に入る番号を選べ。`,
        ]
          .filter(Boolean)
          .join("\n\n"),
        choices: markChoices(maxAnswerValue(Object.values(sub.answers))),
        answerIndex: value,
        // 同じ親資料を全空欄に引き継ぐ
        context: materials.context,
        figure: materials.figure,
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
        question: [
          headingFor(q, label),
          sub.prompt,
          `空欄［${label}］に入る番号を選べ。`,
        ]
          .filter(Boolean)
          .join("\n\n"),
        choices: markChoices(
          maxAnswerValue(Object.values(sub.correct_values)),
        ),
        answerIndex: value,
        context: materials.context,
        figure: materials.figure,
        explanation: sub.explanation ?? q.explanation,
      });
    }
    return;
  }

  if (sub.correct_value != null) {
    pushItem(list, {
      id: baseId,
      ...shared,
      question: [
        headingFor(q, sub.target_label),
        sub.prompt,
        "マークシートに記入する番号を選べ。",
      ]
        .filter(Boolean)
        .join("\n\n"),
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
  const materials = collectSharedMaterials(q);
  const sectionTitle = normalizeSectionTitle(section.section_title);

  const sharedBase = {
    sectionId: section.section_id,
    sectionTitle,
    topic: q.topic,
    subId: q.sub_id,
    context: materials.context,
    figure: materials.figure,
    explanation: q.explanation,
  };

  if (q.choices && q.correct_choice_id != null) {
    pushItem(list, {
      id: q.question_id,
      ...sharedBase,
      targetLabel: q.target_label,
      // 単体問題は設問文を question に。context に重複しないよう整理
      question: [headingFor(q, q.target_label), q.question_text]
        .filter(Boolean)
        .join("\n\n"),
      context: q.context,
      figure: materials.figure,
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
    const details = q.answer_details;
    for (const [label, value] of Object.entries(q.answers)) {
      const detail = details?.[label];
      pushItem(list, {
        id: `${q.question_id}-${label}`,
        ...sharedBase,
        targetLabel: label,
        question: [
          headingFor(q, label),
          `空欄［${label}］に入る番号を選べ。`,
        ].join("\n\n"),
        // 同じ表・問題文を全空欄に表示
        context: materials.context,
        figure: materials.figure,
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
    const max = maxAnswerValue(q.correct_choice_ids);
    pushItem(list, {
      id: q.question_id,
      ...sharedBase,
      question: [
        headingFor(q),
        q.topic ?? "正しいものをすべて選べ。",
        "当てはまる番号をすべて選んでください（複数選択）。",
      ].join("\n\n"),
      choices: markChoices(max),
      answerIndex: q.correct_choice_ids[0],
      answerIndexes: q.correct_choice_ids,
      multiSelect: true,
      explanation: q.explanation,
    });
    return;
  }

  if (q.correct_choice_id != null) {
    pushItem(list, {
      id: q.question_id,
      ...sharedBase,
      question: [
        headingFor(q),
        q.topic ?? "問題",
        "マークシートに記入する番号を選べ。",
      ].join("\n\n"),
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
  const source = data.metadata?.source ?? "共通テスト対策問題";
  const version = data.metadata?.version;
  return version ? `${source}（v${version}）` : source;
}

export function getAllExamQuestions(): ExamQuestion[] {
  return questions;
}

export function getExamSections(): ExamSectionInfo[] {
  return data.sections.map((s) => ({
    id: s.section_id,
    title: normalizeSectionTitle(s.section_title),
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
    sectionId === "all" ? all : all.filter((q) => q.sectionId === sectionId);
  const count = resolveQuestionCount(filtered.length, countOption, customCount);
  return filtered.slice(0, count);
}
