export type UserType = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  type: UserType;
  password: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  type: UserType;
}
