import { User } from "../types";

export function sanitizeUser(u: User) {
  const { passwordHash, ...safe } = u;
  return safe;
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
