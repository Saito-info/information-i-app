import rawTerms from "@/data/essentials_informatics_terms.json";
import type { TermItem } from "@/lib/types";

type RawTerm = {
  term: string;
  meaning: string;
  category: string;
};

const STUDY_FIELD_ORDER = [
  "情報社会の問題解決",
  "コミュニケーションと情報デザイン",
  "コンピュータとプログラミング",
  "情報通信ネットワークとデータの活用",
] as const;

const terms: TermItem[] = (rawTerms as RawTerm[]).map((item, index) => ({
  id: String(index + 1),
  term: item.term,
  meaning: item.meaning,
  category: item.category,
}));

export function getAllTerms(): TermItem[] {
  return terms;
}

export function getCategories(): string[] {
  const present = new Set(terms.map((t) => t.category));
  const ordered = STUDY_FIELD_ORDER.filter((c) => present.has(c));
  const extras = [...present].filter(
    (c) => !STUDY_FIELD_ORDER.includes(c as (typeof STUDY_FIELD_ORDER)[number]),
  );
  return [...ordered, ...extras.sort()];
}

export function getTermById(id: string): TermItem | undefined {
  return terms.find((t) => t.id === id);
}
