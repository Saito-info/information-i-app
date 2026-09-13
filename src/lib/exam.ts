import info1 from "@/data/exams/info1_exam_data.json";
import kawaiVol1 from "@/data/exams/kawai_common_test_vol1-v2.json";
import kawaiVol2 from "@/data/exams/kawai_common_test_vol2.json";
import kawaiVol3 from "@/data/exams/kawai_common_test_vol3.json";
import kawaiVol4 from "@/data/exams/kawai_common_test_vol4.json";
import r7Honshi from "@/data/exams/r7_honshiken_info1_data.json";
import r7Tsuishi from "@/data/exams/r7_tsuishiken_info1_data.json";
import r8Honshi from "@/data/exams/r8_honshiken_info1_data.json";
import r8Tsuishi from "@/data/exams/r8_tsuishiken_info1_data.json";
import type { ExamQuestion, ExamSourceInfo } from "@/lib/types";

const CIRCLED = "⓪①②③④⑤⑥⑦⑧⑨";

type AnyRecord = Record<string, unknown>;

type SourceDef = {
  id: string;
  title: string;
  data: unknown;
};

const SOURCE_DEFS: SourceDef[] = [
  {
    id: "kawai-vol1",
    title: "河合塾 直前対策 第1回",
    data: kawaiVol1,
  },
  {
    id: "kawai-vol2",
    title: "河合塾 直前対策 第2回",
    data: kawaiVol2,
  },
  {
    id: "kawai-vol3",
    title: "河合塾 直前対策 第3回",
    data: kawaiVol3,
  },
  {
    id: "kawai-vol4",
    title: "河合塾 直前対策 第4回",
    data: kawaiVol4,
  },
  {
    id: "info1-specimen",
    title: "共通テスト 試作問題",
    data: info1,
  },
  {
    id: "r7-honshi",
    title: "令和7年度 本試験",
    data: r7Honshi,
  },
  {
    id: "r7-tsuishi",
    title: "令和7年度 追試験",
    data: r7Tsuishi,
  },
  {
    id: "r8-honshi",
    title: "令和8年度 本試験",
    data: r8Honshi,
  },
  {
    id: "r8-tsuishi",
    title: "令和8年度 追試験",
    data: r8Tsuishi,
  },
];

function asRecord(v: unknown): AnyRecord | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as AnyRecord)
    : null;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function parseAnswerIndex(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.trunc(raw);
  }
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;

  for (const ch of s) {
    const idx = CIRCLED.indexOf(ch);
    if (idx >= 0) return idx;
  }

  const leading = s.match(/^(\d+)/);
  if (leading) return Number(leading[1]);

  const embedded = s.match(/(?:^|[^\d])(\d)(?:[^\d]|$)/);
  if (embedded) return Number(embedded[1]);

  return null;
}

function extractAnswerIndex(node: AnyRecord): number | null {
  if (node.correct_choice_id != null) {
    return parseAnswerIndex(node.correct_choice_id);
  }
  if (node.correct_answer != null) {
    return parseAnswerIndex(node.correct_answer);
  }
  if (node.correct_value != null) {
    return parseAnswerIndex(node.correct_value);
  }

  const answerKey = asRecord(node.answer_key);
  if (answerKey?.correct_option != null) {
    return parseAnswerIndex(answerKey.correct_option);
  }

  const answerObj = asRecord(node.answer);
  if (answerObj) {
    if (answerObj.correct_option != null) {
      return parseAnswerIndex(answerObj.correct_option);
    }
    for (const value of Object.values(answerObj)) {
      const idx = parseAnswerIndex(value);
      if (idx != null) return idx;
    }
  }

  if (typeof node.answer === "string" || typeof node.answer === "number") {
    return parseAnswerIndex(node.answer);
  }

  return null;
}

function normalizeChoiceLabel(text: string, index: number): string {
  const cleaned = text
    .replace(/^[⓪①②③④⑤⑥⑦⑧⑨]\s*/, "")
    .replace(/^\d+\s*[:：.．]\s*/, "")
    .trim();
  return `${CIRCLED[index] ?? index} ${cleaned}`;
}

function normalizeOptions(raw: unknown): string[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  if (typeof raw[0] === "string") {
    return raw.map((t, i) => normalizeChoiceLabel(String(t), i));
  }

  if (asRecord(raw[0])) {
    const items = raw
      .map((item) => asRecord(item))
      .filter((x): x is AnyRecord => Boolean(x))
      .map((item, i) => {
        const id = parseAnswerIndex(item.id ?? item.label ?? i) ?? i;
        const text = String(item.text ?? item.label ?? item.id ?? "");
        return { id, text };
      })
      .sort((a, b) => a.id - b.id);

    if (!items.length) return null;
    return items.map((item) =>
      normalizeChoiceLabel(item.text, item.id),
    );
  }

  return null;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function joinText(parts: Array<string | undefined | null>): string | undefined {
  const filtered = parts.map((p) => p?.trim()).filter(Boolean) as string[];
  return filtered.length ? filtered.join("\n\n") : undefined;
}

function pushMcq(
  list: ExamQuestion[],
  partial: Omit<ExamQuestion, "category" | "choices" | "answerIndex"> & {
    choices: string[] | null;
    answerIndex: number | null;
    answerIndexes?: number[];
    multiSelect?: boolean;
  },
) {
  if (!partial.choices?.length || partial.answerIndex == null) return;
  if (
    partial.answerIndex < 0 ||
    partial.answerIndex >= partial.choices.length
  ) {
    return;
  }

  list.push({
    ...partial,
    choices: partial.choices,
    answerIndex: partial.answerIndex,
    category: partial.sectionTitle || partial.sourceTitle,
  });
}

function formatTable(table: AnyRecord): string | undefined {
  const columns = asArray(table.columns).map(String);
  const rows = asArray(table.rows);
  if (!columns.length || !rows.length) return undefined;
  const lines = [
    table.title ? String(table.title) : null,
    columns.join(" | "),
    columns.map(() => "---").join(" | "),
    ...rows.map((row) =>
      (Array.isArray(row) ? row : []).map(String).join(" | "),
    ),
  ].filter(Boolean);
  return lines.join("\n");
}

function collectMaterials(obj: AnyRecord): {
  context?: string;
  figure?: string;
  figureImages?: string[];
} {
  const context = joinText([
    typeof obj.question_text === "string" ? obj.question_text : null,
    typeof obj.text === "string" ? obj.text : null,
    typeof obj.context === "string" ? obj.context : null,
    typeof obj.context_text === "string" ? obj.context_text : null,
    Array.isArray(obj.dialogue)
      ? `【会話】\n${obj.dialogue.map(String).join("\n")}`
      : null,
  ]);

  const figureParts: string[] = [];
  if (typeof obj.figure_description === "string") {
    figureParts.push(`【図】\n${obj.figure_description}`);
  }
  const figure = asRecord(obj.figure);
  if (figure?.description) {
    figureParts.push(`【図】\n${String(figure.description)}`);
  }
  const seq = asRecord(obj.figure_sequence_diagram);
  if (seq?.mermaid_code) {
    figureParts.push(`【シーケンス図】\n${String(seq.mermaid_code)}`);
  }
  if (typeof obj.code_snippet === "string") {
    figureParts.push(`【プログラム】\n${obj.code_snippet}`);
  }

  for (const key of [
    "table_data",
    "table_1_data",
    "table_3_1_data",
    "table_3_2_data",
  ]) {
    const table = asRecord(obj[key]);
    if (!table) continue;
    const formatted = formatTable(table);
    if (formatted) figureParts.push(`【表】\n${formatted}`);
  }

  for (const fig of asArray(obj.figures)) {
    const f = asRecord(fig);
    if (!f) continue;
    figureParts.push(
      joinText([
        f.fig_number ? String(f.fig_number) : null,
        f.caption ? String(f.caption) : null,
        f.structure ? String(f.structure) : null,
        f.description ? String(f.description) : null,
        f.image ? `画像ファイル: ${String(f.image)}` : null,
      ]) ?? "",
    );
  }

  const figureImages: string[] = [];
  for (const img of asArray(obj.figure_images)) {
    if (typeof img === "string" && img.trim()) figureImages.push(img.trim());
  }
  for (const fig of asArray(obj.figures)) {
    const f = asRecord(fig);
    if (!f?.image) continue;
    const name = String(f.image);
    const url = name.startsWith("/") ? name : `/exam-figures/${name}`;
    if (!figureImages.includes(url)) figureImages.push(url);
  }

  return {
    context,
    figure: figureParts.filter(Boolean).join("\n\n") || undefined,
    figureImages: figureImages.length ? figureImages : undefined,
  };
}

/** ---- vol1-v2 style ---- */
function flattenVol1Style(
  list: ExamQuestion[],
  source: SourceDef,
  data: AnyRecord,
) {
  for (const sectionRaw of asArray(data.sections)) {
    const section = asRecord(sectionRaw);
    if (!section) continue;
    const sectionId = String(section.section_id ?? "section");
    const sectionTitle = String(section.section_title ?? "大問").replace(
      "第4问",
      "第4問",
    );

    for (const qRaw of asArray(section.questions)) {
      const q = asRecord(qRaw);
      if (!q) continue;
      flattenGenericQuestion(list, source, sectionId, sectionTitle, q);
    }
  }
}

function flattenGenericQuestion(
  list: ExamQuestion[],
  source: SourceDef,
  sectionId: string,
  sectionTitle: string,
  q: AnyRecord,
) {
  const materials = collectMaterials(q);
  const base = {
    sourceId: source.id,
    sourceTitle: source.title,
    sectionId,
    sectionTitle,
    topic: typeof q.topic === "string" ? q.topic : undefined,
    subId:
      typeof q.sub_id === "string"
        ? q.sub_id
        : typeof q.question_number === "string"
          ? q.question_number
          : undefined,
    context: materials.context,
    figure: materials.figure,
    figureImages: materials.figureImages,
  };

  // Direct MCQ with options as { ア: [...], イ: [...] }
  const optionsByBlank = asRecord(q.options);
  const answerByBlank =
    asRecord(q.correct_answer) || asRecord(q.answer) || asRecord(q.answers);
  if (optionsByBlank && !Array.isArray(q.options) && answerByBlank) {
    for (const [blank, opts] of Object.entries(optionsByBlank)) {
      pushMcq(list, {
        id: `${source.id}:${String(q.question_id ?? q.question_number ?? list.length)}-${blank}`,
        ...base,
        targetLabel: blank,
        question: joinText([
          base.subId,
          typeof q.question_text === "string" ? q.question_text : null,
          typeof q.text === "string" ? q.text : null,
          `空欄［${blank}］について選べ。`,
        ])!,
        context: materials.context,
        figure: materials.figure,
        choices: normalizeOptions(opts),
        answerIndex: parseAnswerIndex(answerByBlank[blank]),
        explanation:
          typeof q.explanation === "string" ? q.explanation : undefined,
      });
    }
  } else if (q.choices || Array.isArray(q.options)) {
    // Direct MCQ (array choices/options)
    const choices = normalizeOptions(q.choices ?? q.options);
    const answerIndex = extractAnswerIndex(q);
    pushMcq(list, {
      id: `${source.id}:${String(q.question_id ?? q.question_number ?? list.length)}`,
      ...base,
      targetLabel:
        typeof q.target_label === "string"
          ? q.target_label
          : typeof q.mark_symbol === "string"
            ? q.mark_symbol
            : typeof q.target_blank === "string"
              ? q.target_blank
              : undefined,
      question: joinText([
        base.subId,
        typeof q.question_text === "string" ? q.question_text : null,
        typeof q.text === "string" ? q.text : null,
      ])!,
      context:
        typeof q.context === "string" || typeof q.context_text === "string"
          ? joinText([
              typeof q.context === "string" ? q.context : null,
              typeof q.context_text === "string" ? q.context_text : null,
            ])
          : undefined,
      figure: materials.figure,
      choices,
      answerIndex,
      explanation:
        typeof q.explanation === "string" ? q.explanation : undefined,
    });
  } else if (answerByBlank && !q.choices && !Array.isArray(q.options)) {
    // 選択肢本文なし → マーク番号選択
    const details = asRecord(q.answer_details);
    const values = Object.values(answerByBlank)
      .map((v) => parseAnswerIndex(v))
      .filter((v): v is number => v != null);
    const max = Math.max(9, ...values, 0);
    const choices = Array.from({ length: max + 1 }, (_, i) =>
      normalizeChoiceLabel(String(i), i),
    );
    for (const [blank, value] of Object.entries(answerByBlank)) {
      const detail = details?.[blank];
      pushMcq(list, {
        id: `${source.id}:${String(q.question_id ?? q.question_number ?? list.length)}-${blank}`,
        ...base,
        targetLabel: blank,
        question: joinText([
          base.subId,
          typeof q.topic === "string" ? q.topic : null,
          typeof q.question_text === "string" ? q.question_text : null,
          typeof q.text === "string" ? q.text : null,
          `空欄［${blank}］に入る番号を選べ。`,
        ])!,
        context: materials.context,
        figure: materials.figure,
        choices,
        answerIndex: parseAnswerIndex(value),
        explanation: joinText([
          detail ? `正解の内容: ${String(detail)}` : null,
          typeof q.explanation === "string" ? q.explanation : null,
        ]),
      });
    }
  } else if (
    (typeof q.correct_answer === "string" ||
      typeof q.answer === "string" ||
      typeof q.correct_answer === "number") &&
    !q.choices &&
    !Array.isArray(q.options)
  ) {
    const answerIndex = extractAnswerIndex(q);
    const max = Math.max(9, answerIndex ?? 0);
    const choices = Array.from({ length: max + 1 }, (_, i) =>
      normalizeChoiceLabel(String(i), i),
    );
    pushMcq(list, {
      id: `${source.id}:${String(q.question_id ?? q.question_number ?? list.length)}`,
      ...base,
      targetLabel:
        typeof q.mark_symbol === "string" ? q.mark_symbol : undefined,
      question: joinText([
        base.subId,
        typeof q.question_text === "string" ? q.question_text : null,
        typeof q.text === "string" ? q.text : null,
        "マークシートに記入する番号を選べ。",
      ])!,
      context: materials.context,
      figure: materials.figure,
      choices,
      answerIndex,
      explanation:
        typeof q.explanation === "string" ? q.explanation : undefined,
    });
  }

  // Multi select
  if (Array.isArray(q.correct_choice_ids) && q.correct_choice_ids.length) {
    const indexes = q.correct_choice_ids
      .map((v) => parseAnswerIndex(v))
      .filter((v): v is number => v != null);
    const max = Math.max(9, ...indexes);
    const choices = Array.from({ length: max + 1 }, (_, i) =>
      normalizeChoiceLabel(String(i), i),
    );
    pushMcq(list, {
      id: `${source.id}:${String(q.question_id ?? list.length)}-multi`,
      ...base,
      question: joinText([
        base.subId,
        typeof q.topic === "string" ? q.topic : null,
        "当てはまる番号をすべて選んでください（複数選択）。",
      ])!,
      choices,
      answerIndex: indexes[0] ?? null,
      answerIndexes: indexes,
      multiSelect: true,
      explanation:
        typeof q.explanation === "string" ? q.explanation : undefined,
    });
  }

  // nested sub_questions
  for (const [index, subRaw] of asArray(q.sub_questions).entries()) {
    const sub = asRecord(subRaw);
    if (!sub) continue;
    flattenSubItem(list, source, sectionId, sectionTitle, q, sub, index);
  }

  // vol4 sub_items under sub_questions already handled; also direct sub_items
  for (const [index, subRaw] of asArray(q.sub_items).entries()) {
    const sub = asRecord(subRaw);
    if (!sub) continue;
    flattenSubItem(list, source, sectionId, sectionTitle, q, sub, index);
  }
}

function flattenSubItem(
  list: ExamQuestion[],
  source: SourceDef,
  sectionId: string,
  sectionTitle: string,
  parent: AnyRecord,
  sub: AnyRecord,
  index: number,
) {
  const parentMaterials = collectMaterials(parent);
  const subMaterials = collectMaterials(sub);
  const context = joinText([parentMaterials.context, subMaterials.context]);
  const figure = joinText([parentMaterials.figure, subMaterials.figure]);
  const figureImages = [
    ...(parentMaterials.figureImages ?? []),
    ...(subMaterials.figureImages ?? []),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const label = String(
    sub.target_label ??
      sub.blank ??
      sub.symbol ??
      sub.mark_symbol ??
      sub.label ??
      index,
  );
  const prompt = String(
    sub.prompt ?? sub.text ?? sub.question_text ?? "次の問いに答えよ。",
  );

  // multi-select on sub
  if (Array.isArray(sub.correct_choice_ids) && sub.correct_choice_ids.length) {
    const indexes = sub.correct_choice_ids
      .map((v) => parseAnswerIndex(v))
      .filter((v): v is number => v != null);
    const choices = normalizeOptions(sub.choices ?? sub.options);
    const max = Math.max(
      choices?.length ? choices.length - 1 : 0,
      9,
      ...indexes,
    );
    const finalChoices =
      choices ??
      Array.from({ length: max + 1 }, (_, i) =>
        normalizeChoiceLabel(String(i), i),
      );
    pushMcq(list, {
      id: `${source.id}:${String(parent.question_id ?? sectionId)}-${label}-multi`,
      sourceId: source.id,
      sourceTitle: source.title,
      sectionId,
      sectionTitle,
      subId: String(sub.sub_id ?? sub.number ?? label),
      targetLabel: label,
      question: joinText([
        String(sub.sub_id ?? sub.number ?? ""),
        prompt,
        "当てはまる番号をすべて選んでください（複数選択）。",
      ])!,
      context,
      figure,
      figureImages,
      choices: finalChoices,
      answerIndex: indexes[0] ?? null,
      answerIndexes: indexes,
      multiSelect: true,
      explanation:
        typeof sub.explanation === "string" ? sub.explanation : undefined,
    });
    return;
  }

  // options object keyed by blank (r8本試) OR correct_answer object with options object
  const optionsObj = asRecord(sub.options);
  const answerObj =
    asRecord(sub.answer) || asRecord(sub.correct_answer) || asRecord(sub.answers);
  if (optionsObj && !Array.isArray(sub.options) && answerObj) {
    for (const [blank, opts] of Object.entries(optionsObj)) {
      const choices = normalizeOptions(opts);
      const answerIndex = parseAnswerIndex(answerObj[blank]);
      pushMcq(list, {
        id: `${source.id}:${String(parent.question_id ?? parent.question_number ?? sectionId)}-${blank}`,
        sourceId: source.id,
        sourceTitle: source.title,
        sectionId,
        sectionTitle,
        topic: typeof parent.topic === "string" ? parent.topic : undefined,
        subId: String(sub.sub_id ?? sub.number ?? sub.question_id ?? label),
        targetLabel: blank,
        question: joinText([
          String(sub.sub_id ?? sub.number ?? sub.question_id ?? ""),
          `[${blank}]`,
          prompt,
        ])!,
        context,
        figure,
        figureImages,
        choices,
        answerIndex,
        explanation:
          typeof sub.explanation === "string"
            ? sub.explanation
            : typeof parent.explanation === "string"
              ? parent.explanation
              : undefined,
      });
    }
    return;
  }

  const choices = normalizeOptions(
    sub.choices ?? sub.options ?? sub.options_u ?? sub.options_e,
  );
  const answerIndex = extractAnswerIndex(sub);

  // answer map on sub
  const subAnswers = asRecord(sub.answers);
  if (subAnswers) {
    const values = Object.values(subAnswers)
      .map((v) => parseAnswerIndex(v))
      .filter((v): v is number => v != null);
    const max = Math.max(3, ...values);
    const markChoices = Array.from({ length: max + 1 }, (_, i) =>
      normalizeChoiceLabel(String(i), i),
    );
    for (const [blank, value] of Object.entries(subAnswers)) {
      pushMcq(list, {
        id: `${source.id}:${String(parent.question_id ?? sectionId)}-${label}-${blank}`,
        sourceId: source.id,
        sourceTitle: source.title,
        sectionId,
        sectionTitle,
        targetLabel: blank,
        question: joinText([prompt, `空欄［${blank}］に入る番号を選べ。`])!,
        context,
        figure,
        figureImages,
        choices: markChoices,
        answerIndex: parseAnswerIndex(value),
        explanation:
          typeof sub.explanation === "string" ? sub.explanation : undefined,
      });
    }
    return;
  }

  pushMcq(list, {
    id: `${source.id}:${String(parent.question_id ?? parent.question_number ?? sectionId)}-${label}`,
    sourceId: source.id,
    sourceTitle: source.title,
    sectionId,
    sectionTitle,
    topic: typeof parent.topic === "string" ? parent.topic : undefined,
    subId: String(sub.sub_id ?? sub.number ?? sub.question_id ?? label),
    targetLabel: label,
    question: joinText([
      String(sub.sub_id ?? sub.number ?? sub.question_id ?? ""),
      `[${label}]`,
      prompt,
    ])!,
    context,
    figure,
    figureImages,
    choices,
    answerIndex,
    explanation: joinText([
      typeof sub.explanation === "string" ? sub.explanation : null,
      typeof asRecord(sub.answer)?.explanation === "string"
        ? String(asRecord(sub.answer)?.explanation)
        : null,
      typeof parent.explanation === "string" ? parent.explanation : null,
    ]),
  });

  // nested deeper (vol4)
  for (const [i, nestedRaw] of asArray(sub.sub_items).entries()) {
    const nested = asRecord(nestedRaw);
    if (!nested) continue;
    flattenSubItem(
      list,
      source,
      sectionId,
      sectionTitle,
      { ...parent, ...sub, context: context, figure_description: figure },
      nested,
      i,
    );
  }
}

function flattenBySections(
  list: ExamQuestion[],
  source: SourceDef,
  data: AnyRecord,
  sectionTitleKey: "section_title" | "title" = "section_title",
) {
  for (const sectionRaw of asArray(data.sections)) {
    const section = asRecord(sectionRaw);
    if (!section) continue;
    const sectionId = String(
      section.section_number ?? section.section_id ?? list.length,
    );
    const sectionTitle = String(
      section[sectionTitleKey] ?? section.section_title ?? section.title ?? "大問",
    ).replace("第4问", "第4問").replace("第2问", "第2問");

    for (const qRaw of asArray(section.questions)) {
      const q = asRecord(qRaw);
      if (!q) continue;
      flattenGenericQuestion(list, source, sectionId, sectionTitle, q);
    }
  }
}

function flattenTopLevelQuestions(
  list: ExamQuestion[],
  source: SourceDef,
  data: AnyRecord,
) {
  for (const [i, qRaw] of asArray(data.questions).entries()) {
    const q = asRecord(qRaw);
    if (!q) continue;
    const sectionId = String(
      q.section_number ?? q.section ?? q.question_number ?? i + 1,
    );
    const sectionTitle = String(
      q.section_title ??
        q.title ??
        q.section ??
        q.question_number ??
        `第${i + 1}問`,
    ).replace("第4问", "第4問").replace("第2问", "第2問");

    // If this node itself is a section wrapper with sub_questions
    if (asArray(q.sub_questions).length) {
      flattenGenericQuestion(list, source, sectionId, sectionTitle, q);
      continue;
    }

    flattenGenericQuestion(list, source, sectionId, sectionTitle, q);
  }
}

function normalizeSource(source: SourceDef): ExamQuestion[] {
  const list: ExamQuestion[] = [];
  const data = asRecord(source.data);
  if (!data) return list;

  if (source.id === "kawai-vol1") {
    flattenVol1Style(list, source, data);
    return list;
  }

  if (asArray(data.sections).length) {
    flattenBySections(
      list,
      source,
      data,
      source.id === "r7-honshi" ? "title" : "section_title",
    );
  }

  if (asArray(data.questions).length) {
    flattenTopLevelQuestions(list, source, data);
  }

  return list;
}

const allQuestions: ExamQuestion[] = SOURCE_DEFS.flatMap((source) =>
  normalizeSource(source),
);

export function getExamSourceLabel(): string {
  return `共通テスト形式 問題集（全${SOURCE_DEFS.length}分野）`;
}

export function getAllExamQuestions(): ExamQuestion[] {
  return allQuestions;
}

export function getExamSources(): ExamSourceInfo[] {
  return SOURCE_DEFS.map((source) => ({
    id: source.id,
    title: source.title,
    count: allQuestions.filter((q) => q.sourceId === source.id).length,
  }));
}

/** 互換: 旧API */
export function getExamSections(): ExamSourceInfo[] {
  return getExamSources();
}

export function getExamCategoryCounts(
  all: ExamQuestion[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of all) {
    counts[q.sourceId] = (counts[q.sourceId] ?? 0) + 1;
  }
  return counts;
}

/** 分野を選び、その全問をランダム順で出題（出題数指定なし） */
export function buildExamDeck(
  all: ExamQuestion[],
  sourceId: string,
): ExamQuestion[] {
  const filtered =
    sourceId === "all" ? all : all.filter((q) => q.sourceId === sourceId);
  return shuffle(filtered);
}
