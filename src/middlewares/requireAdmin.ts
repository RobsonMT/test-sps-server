import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./requireAuth";

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).json({ message: "Não autenticado" });
  if (req.user.type !== "admin")
    return res.status(403).json({ message: "Acesso restrito ao admin" });
  next();
}
