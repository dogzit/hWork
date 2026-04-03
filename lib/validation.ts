export function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}
