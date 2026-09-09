const STORAGE_KEY = "information-i-learning-record";

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

export function loadLearningRecord(): LearningRecord {
  if (!isBrowser()) return { ...EMPTY_RECORD, incorrectIds: [], uncertainIds: [] };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)];
}

/** 不正解として記録し、あやふやリストからは外す */
export function markIncorrect(id: string): LearningRecord {
  const record = loadLearningRecord();
  const next: LearningRecord = {
    incorrectIds: unique([...record.incorrectIds, id]),
    uncertainIds: record.uncertainIds.filter((x) => x !== id),
  };
  saveLearningRecord(next);
  return next;
}

/** あやふやとして記録し、不正解リストからは外す */
export function markUncertain(id: string): LearningRecord {
  const record = loadLearningRecord();
  const next: LearningRecord = {
    incorrectIds: record.incorrectIds.filter((x) => x !== id),
    uncertainIds: unique([...record.uncertainIds, id]),
  };
  saveLearningRecord(next);
  return next;
}

/** 正解時は両リストから削除 */
export function markCorrect(id: string): LearningRecord {
  const record = loadLearningRecord();
  const next: LearningRecord = {
    incorrectIds: record.incorrectIds.filter((x) => x !== id),
    uncertainIds: record.uncertainIds.filter((x) => x !== id),
  };
  saveLearningRecord(next);
  return next;
}
