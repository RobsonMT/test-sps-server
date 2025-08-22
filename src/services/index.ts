import { users } from "../database";
import { CreateUserInput, User, UserType } from "../types";
import { v4 as uuid } from "uuid";
import * as bcrypt from "bcryptjs";

export function getAllUsers(): User[] {
  return users.slice();
}

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const now = new Date();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: User = {
    id: uuid(),
    name: input.name,
    email: input.email.toLowerCase(),
    type: input.type,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Omit<CreateUserInput, "password">> & { password?: string }
): Promise<User | undefined> {
  const user = users.find((u) => u.id === id);
  if (!user) return;

  if (typeof data.name === "string") user.name = data.name;
  if (typeof data.email === "string") user.email = data.email.toLowerCase();
  if (data.type === "admin" || data.type === "user") user.type = data.type;
  if (typeof data.password === "string" && data.password.trim()) {
    user.passwordHash = await bcrypt.hash(data.password, 10);
  }
  user.updatedAt = new Date();
  return user;
}

export function deleteUser(id: string): boolean {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
}
