import type {
  ExamHistoryEntry,
  HistoryEntry,
  StudyHistoryEntry,
} from "@/lib/types";

const LEARNING_KEY = "information-i-learning-record";
const EXAM_WRONG_KEY = "information-i-exam-wrong-ids";
const HISTORY_KEY = "information-i-history";

export type LearningRecord = {
  incorrectIds: string[];
  uncertainIds: string[];
};

const EMPTY_RECORD: LearningRecord = {
  incorrectIds: [],
  uncertainIds: [],
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function loadLearningRecord(): LearningRecord {
  if (!isBrowser()) return { incorrectIds: [], uncertainIds: [] };

  try {
    const raw = localStorage.getItem(LEARNING_KEY);
    if (!raw) return { incorrectIds: [], uncertainIds: [] };
    const parsed = JSON.parse(raw) as Partial<LearningRecord>;
    return {
      incorrectIds: Array.isArray(parsed.incorrectIds)
        ? parsed.incorrectIds.map(String)
        : [],
      uncertainIds: Array.isArray(parsed.uncertainIds)
        ? parsed.uncertainIds.map(String)
        : [],
    };
  } catch {
    return { incorrectIds: [], uncertainIds: [] };
  }
}

function saveLearningRecord(record: LearningRecord): void {
  if (!isBrowser()) return;
  localStorage.setItem(LEARNING_KEY, JSON.stringify(record));
}

export function markIncorrect(id: string): LearningRecord {
  const record = loadLearningRecord();
  const next: LearningRecord = {
    incorrectIds: unique([...record.incorrectIds, id]),
    uncertainIds: record.uncertainIds.filter((x) => x !== id),
  };
  saveLearningRecord(next);
  return next;
}

export function markUncertain(id: string): LearningRecord {
  const record = loadLearningRecord();
  const next: LearningRecord = {
    incorrectIds: record.incorrectIds.filter((x) => x !== id),
    uncertainIds: unique([...record.uncertainIds, id]),
  };
  saveLearningRecord(next);
  return next;
}

export function markCorrect(id: string): LearningRecord {
  const record = loadLearningRecord();
  const next: LearningRecord = {
    incorrectIds: record.incorrectIds.filter((x) => x !== id),
    uncertainIds: record.uncertainIds.filter((x) => x !== id),
  };
  saveLearningRecord(next);
  return next;
}

export function loadExamWrongIds(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(EXAM_WRONG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function saveExamWrongIds(ids: string[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(EXAM_WRONG_KEY, JSON.stringify(unique(ids)));
}

export function addExamWrongIds(ids: string[]): string[] {
  const next = unique([...loadExamWrongIds(), ...ids]);
  saveExamWrongIds(next);
  return next;
}

export function removeExamWrongId(id: string): string[] {
  const next = loadExamWrongIds().filter((x) => x !== id);
  saveExamWrongIds(next);
  return next;
}

export function clearExamWrongIds(): void {
  saveExamWrongIds([]);
}

export function loadHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 200)));
}

export function addHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory()];
  saveHistory(next);
  return next;
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const next = loadHistory().filter((e) => e.id !== id);
  saveHistory(next);
  return next;
}

export function clearHistory(): HistoryEntry[] {
  saveHistory([]);
  return [];
}

export function createStudyHistory(
  partial: Omit<StudyHistoryEntry, "id" | "at">,
): StudyHistoryEntry {
  return {
    ...partial,
    id: `study-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
  };
}

export function createExamHistory(
  partial: Omit<ExamHistoryEntry, "id" | "at">,
): ExamHistoryEntry {
  return {
    ...partial,
    id: `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
  };
}

export { EMPTY_RECORD };
