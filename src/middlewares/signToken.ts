import jwt from "jsonwebtoken";
import { JWTPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}
