export const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const;
export type Day = (typeof DAYS)[number];

export type TimetableItem = {
  id: string;
  day: Day;
  lessonNumber: number;
  subject: string;
  createdAt: string; // API response дээр string болж ирдэг
};

export type TimetableUpsertBody = {
  day: Day;
  lessonNumber: number;
  subject: string;
};

export type TimetablePatchBody = Partial<TimetableUpsertBody>;

export type ApiError = { error: string };
export type ApiOk<T> = T;

export function isDay(x: unknown): x is Day {
  return typeof x === "string" && (DAYS as readonly string[]).includes(x);
}

export function isInt(x: unknown): x is number {
  return typeof x === "number" && Number.isInteger(x);
}

export function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

export function parseUpsertBody(input: unknown): TimetableUpsertBody | null {
  if (typeof input !== "object" || input === null) return null;
  const b = input as Record<string, unknown>;

  if (!isDay(b.day)) return null;
  if (!isInt(b.lessonNumber) || b.lessonNumber < 1 || b.lessonNumber > 12)
    return null;
  if (!isNonEmptyString(b.subject)) return null;

  return {
    day: b.day,
    lessonNumber: b.lessonNumber,
    subject: b.subject.trim(),
  };
}

export function parsePatchBody(input: unknown): TimetablePatchBody | null {
  if (typeof input !== "object" || input === null) return null;
  const b = input as Record<string, unknown>;

  const out: TimetablePatchBody = {};

  if (b.day !== undefined) {
    if (!isDay(b.day)) return null;
    out.day = b.day;
  }

  if (b.lessonNumber !== undefined) {
    if (!isInt(b.lessonNumber) || b.lessonNumber < 1 || b.lessonNumber > 12)
      return null;
    out.lessonNumber = b.lessonNumber;
  }

  if (b.subject !== undefined) {
    if (!isNonEmptyString(b.subject)) return null;
    out.subject = b.subject.trim();
  }

  return out;
}
