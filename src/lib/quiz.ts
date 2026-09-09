import type {
  QuestionCountOption,
  ReviewFilter,
  TermItem,
} from "@/lib/types";
import type { LearningRecord } from "@/lib/storage";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function resolveQuestionCount(
  poolSize: number,
  countOption: QuestionCountOption,
  customCount: number,
): number {
  if (poolSize === 0) return 0;
  if (countOption === "all") return poolSize;
  if (countOption === "custom") {
    const n = Math.max(1, Math.floor(customCount) || 1);
    return Math.min(n, poolSize);
  }
  return Math.min(Number(countOption), poolSize);
}

export function buildStudyDeck(
  terms: TermItem[],
  category: string,
  countOption: QuestionCountOption,
  customCount: number,
): TermItem[] {
  const filtered =
    category === "all"
      ? terms
      : terms.filter((t) => t.category === category);
  const count = resolveQuestionCount(filtered.length, countOption, customCount);
  return shuffle(filtered).slice(0, count);
}

export function buildReviewDeck(
  terms: TermItem[],
  record: LearningRecord,
  filter: ReviewFilter,
  countOption: QuestionCountOption,
  customCount: number,
): TermItem[] {
  const incorrectSet = new Set(record.incorrectIds);
  const uncertainSet = new Set(record.uncertainIds);

  let targetIds: string[];
  if (filter === "incorrect") {
    targetIds = record.incorrectIds;
  } else if (filter === "uncertain") {
    targetIds = record.uncertainIds;
  } else {
    targetIds = uniqueIds([...record.incorrectIds, ...record.uncertainIds]);
  }

  const idSet = new Set(targetIds);
  const filtered = terms.filter((t) => idSet.has(t.id));

  // 不正解を優先して並べ替え（復習の「すべて」時）
  const ordered =
    filter === "all"
      ? [
          ...filtered.filter((t) => incorrectSet.has(t.id)),
          ...filtered.filter(
            (t) => uncertainSet.has(t.id) && !incorrectSet.has(t.id),
          ),
        ]
      : filtered;

  const count = resolveQuestionCount(ordered.length, countOption, customCount);
  return shuffle(ordered).slice(0, count);
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}
