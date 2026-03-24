import { customAlphabet } from "nanoid";

// URL-safe, lowercase alphanumeric only — no ambiguous chars (l, 1, O, 0)
const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";

const nanoid = customAlphabet(alphabet, 8);

export function generateShortId(): string {
  return nanoid();
}
