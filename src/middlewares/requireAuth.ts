import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWTPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Token não enviado" });

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Formato do token inválido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}
