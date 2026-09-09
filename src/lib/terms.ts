import rawTerms from "@/data/essentials_informatics_terms.json";
import type { TermItem } from "@/lib/types";

type RawTerm = {
  term: string;
  meaning: string;
  category: string;
};

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
  return [...new Set(terms.map((t) => t.category))];
}

export function getTermById(id: string): TermItem | undefined {
  return terms.find((t) => t.id === id);
}
