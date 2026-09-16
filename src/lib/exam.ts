import catalogJson from "@/data/exams/catalog.json";
import common2025Hon from "@/data/exams/common_test_2025_hon_info1.json";
import common2025Tsui from "@/data/exams/common_test_2025_tsui_info1.json";
import common2026Hon from "@/data/exams/common_test_2026_hon_info1.json";
import common2026Tsui from "@/data/exams/common_test_2026_tsui_info1.json";
import kawai2025_1st from "@/data/exams/kawai_1st_2025_info1.json";
import kawai2025_2nd from "@/data/exams/kawai_2025_info1_2nd.json";
import kawai2025_3rd from "@/data/exams/kawai_2025_info1_3rd.json";
import kawai2025Pre from "@/data/exams/kawai_pre_2025_info1.json";
import kawai2026_2nd from "@/data/exams/kawai_common_test_2026_info1_2nd.json";
import shinken2025_06 from "@/data/exams/shinken_2025_06_info1.json";
import shinken2025_09 from "@/data/exams/shinken_2025_09_info1.json";
import shinken2025_11 from "@/data/exams/shinken_2025_11_info1.json";
import shinken2026_06 from "@/data/exams/shinken_2026_06_info1.json";
import shisaku2025 from "@/data/exams/shisaku_2025_info1.json";
import type {
  ExamFieldId,
  ExamFieldSelection,
  ExamQuestion,
  ExamSessionMeta,
  ExamSettings,
  ExamSourceInfo,
} from "@/lib/types";

const CIRCLED = "⓪①②③④⑤⑥⑦⑧⑨";

type AnyRecord = Record<string, unknown>;

type CatalogSource = {
  id: string;
  title: string;
  json: string;
  pages: Record<string, string[]>;
  answerPages: string[];
};

type SourceBundle = {
  id: string;
  title: string;
  data: unknown;
  pages: Record<string, string[]>;
  answerPages: string[];
};

const RAW_BY_JSON: Record<string, unknown> = {
  "common_test_2025_hon_info1.json": common2025Hon,
  "common_test_2025_tsui_info1.json": common2025Tsui,
  "common_test_2026_hon_info1.json": common2026Hon,
  "common_test_2026_tsui_info1.json": common2026Tsui,
  "kawai_1st_2025_info1.json": kawai2025_1st,
  "kawai_2025_info1_2nd.json": kawai2025_2nd,
  "kawai_2025_info1_3rd.json": kawai2025_3rd,
  "kawai_pre_2025_info1.json": kawai2025Pre,
  "kawai_common_test_2026_info1_2nd.json": kawai2026_2nd,
  "shinken_2025_06_info1.json": shinken2025_06,
  "shinken_2025_09_info1.json": shinken2025_09,
  "shinken_2025_11_info1.json": shinken2025_11,
  "shinken_2026_06_info1.json": shinken2026_06,
  "shisaku_2025_info1.json": shisaku2025,
};

const catalogSources = (catalogJson as { sources: CatalogSource[] }).sources;

const SOURCES: SourceBundle[] = catalogSources.map((c) => ({
  id: c.id,
  title: c.title,
  data: RAW_BY_JSON[c.json],
  pages: c.pages ?? {},
  answerPages: c.answerPages ?? [],
}));

function asRecord(v: unknown): AnyRecord | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as AnyRecord)
    : null;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function resolveFieldId(text: string): ExamFieldId | null {
  const m = text.match(/第\s*([1-4１-４])/);
  if (!m?.[1]) return null;
  const map: Record<string, ExamFieldId> = {
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "１": "1",
    "２": "2",
    "３": "3",
    "４": "4",
  };
  return map[m[1]] ?? null;
}

function parseIndex(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.trunc(raw);
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  for (const ch of s) {
    const idx = CIRCLED.indexOf(ch);
    if (idx >= 0) return idx;
  }
  const m = s.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function normalizeChoiceLabel(text: string, index: number): string {
  const cleaned = text
    .replace(/^[⓪①②③④⑤⑥⑦⑧⑨]\s*/, "")
    .replace(/^\d+\s*[:：.．]\s*/, "")
    .trim();
  return `${CIRCLED[index] ?? index} ${cleaned}`;
}

function normalizeOptions(raw: unknown): string[] | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    const parts = raw
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => /^[⓪①②③④⑤⑥⑦⑧⑨0-9]/.test(l));
    if (parts.length >= 2) {
      return parts.map((t, i) => {
        const circled = CIRCLED.indexOf(t[0] ?? "");
        const idx = circled >= 0 ? circled : i;
        return normalizeChoiceLabel(t, idx);
      });
    }
    return null;
  }
  if (!Array.isArray(raw) || raw.length === 0) return null;
  if (typeof raw[0] === "string") {
    return raw.map((t, i) => normalizeChoiceLabel(String(t), i));
  }
  return null;
}

function markChoices(max = 9): string[] {
  return Array.from({ length: max + 1 }, (_, i) =>
    normalizeChoiceLabel(String(i), i),
  );
}

function parseBlankAnswers(raw: unknown): Array<{ blank: string; index: number }> {
  if (typeof raw === "number") return [{ blank: "", index: Math.trunc(raw) }];
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const out: Array<{ blank: string; index: number }> = [];
    for (const [blank, value] of Object.entries(raw as Record<string, unknown>)) {
      const rec = asRecord(value);
      const idx = parseIndex(
        rec?.correct_index ?? rec?.correct_option ?? rec?.correct_value ?? value,
      );
      if (idx != null) out.push({ blank, index: idx });
    }
    return out;
  }
  if (typeof raw !== "string") return [];
  const s = raw.trim();
  if (/^\d+$/.test(s)) return [{ blank: "", index: Number(s) }];

  const pairs = [
    ...s.matchAll(/([ァ-ヶーA-Za-z]+)\s*[:：]\s*([0-9⓪①②③④⑤⑥⑦⑧⑨]+)/g),
  ];
  if (pairs.length) {
    return pairs
      .map((m) => {
        const index = parseIndex(m[2]);
        return index == null ? null : { blank: m[1]!, index };
      })
      .filter((x): x is { blank: string; index: number } => Boolean(x));
  }

  const single = parseIndex(s);
  return single == null ? [] : [{ blank: "", index: single }];
}

function flattenSource(source: SourceBundle): ExamQuestion[] {
  const data = asRecord(source.data);
  if (!data) return [];
  const out: ExamQuestion[] = [];

  for (const sectionRaw of asArray(data.questions)) {
    const section = asRecord(sectionRaw);
    if (!section) continue;
    const sectionText = String(
      section.section_id ?? section.section_title ?? section.title ?? "",
    );
    const fieldId = resolveFieldId(sectionText);
    if (!fieldId) continue;
    const sectionTitle = `第${fieldId}問`;
    const pageImages = source.pages[fieldId] ?? [];
    const answerPageImages = source.answerPages;

    for (const [qi, subRaw] of asArray(section.sub_questions).entries()) {
      const sub = asRecord(subRaw);
      if (!sub) continue;

      const label = String(sub.label ?? sub.question_id ?? `問${qi + 1}`);
      const markSymbol = typeof sub.mark_symbol === "string" ? sub.mark_symbol : undefined;
      const context = String(sub.context ?? sub.question_text ?? sub.text ?? "");
      const explanation =
        typeof sub.explanation === "string" ? sub.explanation : undefined;
      const score = typeof sub.score === "number" ? sub.score : undefined;
      const baseId = String(sub.question_id ?? `${source.id}-${fieldId}-${qi}`);

      const answerNode = asRecord(sub.answer);
      let blanks: Array<{ blank: string; index: number }> = [];
      if (answerNode) {
        if (
          answerNode.correct_index != null ||
          answerNode.correct_option != null
        ) {
          blanks = parseBlankAnswers(
            answerNode.correct_index ?? answerNode.correct_option,
          );
        } else {
          blanks = parseBlankAnswers(answerNode);
        }
      } else {
        blanks = parseBlankAnswers(sub.correct_index);
      }
      if (!blanks.length) continue;

      let choices = normalizeOptions(sub.options ?? sub.choices);
      if (!choices?.length) {
        const max = Math.max(9, ...blanks.map((b) => b.index));
        choices = markChoices(max);
      }

      // 複数空欄で選択肢が1配列のみの場合 → マーク番号選択にフォールバック
      if (blanks.length > 1) {
        const max = Math.max(9, ...blanks.map((b) => b.index));
        const marks = markChoices(max);
        for (const blank of blanks) {
          if (blank.index < 0 || blank.index > max) continue;
          out.push({
            id: `${baseId}:${blank.blank || "x"}`,
            sourceId: source.id,
            sourceTitle: source.title,
            fieldId,
            sectionTitle,
            label,
            markSymbol: blank.blank || markSymbol,
            question: [label, blank.blank ? `空欄［${blank.blank}］` : null, context]
              .filter(Boolean)
              .join("\n\n"),
            choices: marks,
            answerIndex: blank.index,
            score: score != null ? Math.max(1, Math.round(score / blanks.length)) : undefined,
            explanation,
            pageImages,
            answerPageImages,
          });
        }
        continue;
      }

      const only = blanks[0]!;
      if (only.index < 0 || only.index >= choices.length) {
        const max = Math.max(9, only.index, choices.length - 1);
        choices = markChoices(max);
      }
      if (only.index < 0 || only.index >= choices.length) continue;

      out.push({
        id: baseId,
        sourceId: source.id,
        sourceTitle: source.title,
        fieldId,
        sectionTitle,
        label,
        markSymbol: only.blank || markSymbol,
        question: [label, context].filter(Boolean).join("\n\n"),
        choices,
        answerIndex: only.index,
        score,
        explanation,
        pageImages,
        answerPageImages,
      });
    }
  }

  return out;
}

const allQuestions: ExamQuestion[] = SOURCES.flatMap(flattenSource);

export function getExamSourceCount(): number {
  return SOURCES.length;
}

export function getExamSources(): ExamSourceInfo[] {
  return SOURCES.map((source) => ({
    id: source.id,
    title: source.title,
    count: allQuestions.filter((q) => q.sourceId === source.id).length,
  }));
}

export function getAllExamQuestions(): ExamQuestion[] {
  return allQuestions;
}

export function getExamQuestionsByIds(ids: string[]): ExamQuestion[] {
  const map = new Map(allQuestions.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter((q): q is ExamQuestion => Boolean(q));
}

export type ExamSession = {
  questions: ExamQuestion[];
  meta: ExamSessionMeta;
};

export function buildExamSession(settings: ExamSettings): ExamSession | null {
  const source = SOURCES.find((s) => s.id === settings.sourceId);
  if (!source) return null;

  const questions =
    settings.fieldId === "all"
      ? allQuestions.filter((q) => q.sourceId === settings.sourceId)
      : allQuestions.filter(
          (q) =>
            q.sourceId === settings.sourceId && q.fieldId === settings.fieldId,
        );

  if (!questions.length) return null;

  return {
    questions,
    meta: {
      sourceId: source.id,
      sourceTitle: source.title,
      fieldId: settings.fieldId,
      answerPageImages: source.answerPages,
    },
  };
}

export function getFieldLabel(fieldId: ExamFieldSelection): string {
  return fieldId === "all" ? "すべて" : `第${fieldId}問`;
}
