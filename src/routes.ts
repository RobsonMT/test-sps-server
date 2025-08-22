import { Router } from "express";
import { isEmail, sanitizeUser } from "./utils";
import { CreateUserInput } from "./types";
import { AuthRequest, requireAuth } from "./middlewares/requireAuth";
import { requireAdmin } from "./middlewares/requireAdmin";
import * as bcrypt from "bcryptjs";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateUser,
} from "./services";
import { signToken } from "./middlewares/signToken";

const routes = Router();

/**
 * POST /auth/login
 * body: { email, password }
 * retorna: { token }
 */
routes.post("/auth/login", async (req, res) => {
  const { email, password } = (req.body || {}) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "email e password são obrigatórios" });
  }
  const user = findUserByEmail(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });

  const token = signToken({ sub: user.id, email: user.email, type: user.type });
  return res.json({ token, user });
});

/**
 * POST /users
 * body: { email, name, password, type }
 * - valida e-mail único
 * - cria usuário
 */
routes.post("/users", async (req, res) => {
  const { email, name, type, password } = (req.body || {}) as CreateUserInput;

  if (!email || !name || !type || !password) {
    return res
      .status(400)
      .json({ message: "email, name, type e password são obrigatórios" });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ message: "email inválido" });
  }
  if (!["admin", "user"].includes(type)) {
    return res.status(400).json({ message: "type deve ser 'admin' ou 'user'" });
  }
  if (findUserByEmail(email.toLowerCase())) {
    return res.status(409).json({ message: "email já cadastrado" });
  }

  const user = await createUser({ email, name, type, password });
  return res.status(201).json(sanitizeUser(user));
});

/**
 * GET /users
 * - lista usuários (precisa estar autenticado)
 */
routes.get("/users", requireAuth, (req, res) => {
  const users = getAllUsers().map(sanitizeUser);
  return res.json(users);
});

/**
 * GET /users/:id
 * - retorna usuário pelo id (precisa estar autenticado)
 */
routes.get("/users/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  const user = findUserById(id);
  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  return res.json(sanitizeUser(user));
});

/**
 * PUT /users/:id
 * - edita usuário
 * - regra simples: o próprio usuário pode editar seus dados; admin pode editar qualquer um
 */
routes.put("/users/:id", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const requester = req.user!;
  const isSelf = requester.sub === id;

  if (!isSelf && requester.type !== "admin") {
    return res
      .status(403)
      .json({ message: "Sem permissão para editar este usuário" });
  }

  const target = findUserById(id);
  if (!target)
    return res.status(404).json({ message: "Usuário não encontrado" });

  const { email, name, type, password } = req.body || {};

  if (email) {
    if (!isEmail(email))
      return res.status(400).json({ message: "email inválido" });
    const duplicated = findUserByEmail(email.toLowerCase());
    if (duplicated && duplicated.id !== id) {
      return res.status(409).json({ message: "email já cadastrado" });
    }
  }
  if (type && !["admin", "user"].includes(type)) {
    return res.status(400).json({ message: "type deve ser 'admin' ou 'user'" });
  }
  // Usuário comum não pode se promover a admin
  if (type === "admin" && requester.type !== "admin") {
    return res
      .status(403)
      .json({ message: "Apenas admin pode definir type=admin" });
  }

  const updated = await updateUser(id, { email, name, type, password });
  return res.json(sanitizeUser(updated!));
});

/**
 * DELETE /users/:id
 * - exclui usuário (precisa estar autenticado)
 */
routes.delete("/users/:id", requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const ok = deleteUser(id);
  if (!ok) return res.status(404).json({ message: "Usuário não encontrado" });
  return res.status(204).send();
});

export default routes;
