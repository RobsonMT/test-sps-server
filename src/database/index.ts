import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import { CreateUserInput, User } from "../types";

export const users: User[] = [];

export const seedAdmin = async () => {
  const email = "admin@sps.com";
  const password = "admin123";
  const exists = users.find((u) => u.email === email);
  if (exists) return;

  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({
    id: uuid(),
    name: "Admin",
    email,
    type: "admin",
    passwordHash,
    createdAt: now,
    updatedAt: now,
  });
};

export async function resetDb({ seed = true }: { seed?: boolean } = {}) {
  users.splice(0, users.length);
  if (seed) await seedAdmin();
}
