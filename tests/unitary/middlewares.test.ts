import jwt from "jsonwebtoken";
import express, { Request, Response } from "express";
import supertest from "supertest";
import { AuthRequest, requireAuth } from "../../src/middlewares/requireAuth";
import { requireAdmin } from "../../src/middlewares/requireAdmin";
import { signToken } from "../../src/middlewares/signToken";

const app = express();
app.get("/private", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ sub: req.user!.sub, type: req.user!.type });
});
app.get("/admin", requireAuth, requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

describe("auth utils/middlewares", () => {
  test("signToken gera JWT válido", () => {
    const token = signToken({ sub: "123", email: "x@y.com", type: "user" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    expect(decoded.sub).toBe("123");
    expect(decoded.type).toBe("user");
  });

  test("requireAuth bloqueia sem token", async () => {
    await supertest(app).get("/private").expect(401);
  });

  test("requireAuth permite com token", async () => {
    const token = signToken({ sub: "abc", email: "x@y.com", type: "user" });
    const res = await supertest(app)
      .get("/private")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.sub).toBe("abc");
  });

  test("requireAdmin bloqueia não admin", async () => {
    const token = signToken({ sub: "x", email: "u@u.com", type: "user" });
    await supertest(app)
      .get("/admin")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);
  });

  test("requireAdmin permite admin", async () => {
    const token = signToken({ sub: "x", email: "a@a.com", type: "admin" });
    const res = await supertest(app)
      .get("/admin")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.ok).toBe(true);
  });
});
