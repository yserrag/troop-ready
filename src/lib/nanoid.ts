import { customAlphabet } from "nanoid";

// URL-safe, lowercase alphanumeric only — no ambiguous chars (l, 1, O, 0)
const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";

const nanoid8 = customAlphabet(alphabet, 8);
const nanoid6 = customAlphabet(alphabet, 6);

export function generateShortId(): string {
  return nanoid8();
}

export function generateInviteCode(): string {
  return nanoid6();
}
