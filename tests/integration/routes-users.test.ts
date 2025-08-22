import supertest from "supertest";
import app from "../../src";
import { resetDb } from "../../src/database";

async function loginAsAdmin() {
  const res = await supertest(app)
    .post("/auth/login")
    .send({ email: "admin@sps.com", password: "admin123" });
  return res.body.token as string;
}

describe("Users routes", () => {
  beforeEach(async () => {
    await resetDb({ seed: true });
  });

  test("POST /users cria usuário e validações", async () => {
    // cria
    const create = await supertest(app)
      .post("/users")
      .send({
        name: "João",
        email: "joao@ex.com",
        type: "user",
        password: "123456",
      })
      .expect(201);

    expect(create.body.id).toBeDefined();
    expect(create.body.passwordHash).toBeUndefined();

    // email duplicado
    await supertest(app)
      .post("/users")
      .send({
        name: "Outro",
        email: "joao@ex.com",
        type: "user",
        password: "abc",
      })
      .expect(409);

    // email inválido
    await supertest(app)
      .post("/users")
      .send({ name: "X", email: "invalido", type: "user", password: "123" })
      .expect(400);

    // type inválido
    await supertest(app)
      .post("/users")
      .send({ name: "X", email: "x@x.com", type: "manager", password: "123" })
      .expect(400);
  });

  test("GET /users exige autenticação e lista", async () => {
    await supertest(app).get("/users").expect(401);

    const token = await loginAsAdmin();
    const res = await supertest(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // pelo menos o admin
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].passwordHash).toBeUndefined();
  });

  test("GET /users/:id retorna pelo id ou 404", async () => {
    const token = await loginAsAdmin();

    // criar user
    const created = await supertest(app)
      .post("/users")
      .send({
        name: "Ana",
        email: "ana@ex.com",
        type: "user",
        password: "123456",
      })
      .expect(201);

    const id = created.body.id as string;

    // buscar
    const found = await supertest(app)
      .get(`/users/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(found.body.email).toBe("ana@ex.com");

    // 404
    await supertest(app)
      .get("/users/nao-existe")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  test("PUT /users/:id - usuário edita a si mesmo; não pode promover para admin", async () => {
    // cria um user
    const created = await supertest(app)
      .post("/users")
      .send({
        name: "Bob",
        email: "bob@ex.com",
        type: "user",
        password: "abc123",
      })
      .expect(201);

    // login como Bob
    const login = await supertest(app)
      .post("/auth/login")
      .send({ email: "bob@ex.com", password: "abc123" })
      .expect(200);

    const tokenUser = login.body.token as string;
    const id = created.body.id as string;

    // atualiza nome
    const upd = await supertest(app)
      .put(`/users/${id}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({ name: "Bob Silva" })
      .expect(200);

    expect(upd.body.name).toBe("Bob Silva");

    // tenta se promover
    await supertest(app)
      .put(`/users/${id}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({ type: "admin" })
      .expect(403);
  });

  test("PUT /users/:id - admin pode editar qualquer usuário e alterar type/email; evita e-mail duplicado", async () => {
    const tokenAdmin = await loginAsAdmin();

    // cria A e B
    const a = await supertest(app)
      .post("/users")
      .send({ name: "A", email: "a@ex.com", type: "user", password: "111" })
      .expect(201);

    const b = await supertest(app)
      .post("/users")
      .send({ name: "B", email: "b@ex.com", type: "user", password: "222" })
      .expect(201);

    // admin promove A e troca email
    const upd = await supertest(app)
      .put(`/users/${a.body.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ type: "admin", email: "a2@ex.com" })
      .expect(200);

    expect(upd.body.type).toBe("admin");
    expect(upd.body.email).toBe("a2@ex.com");

    // admin tenta setar email já usado por B -> 409
    await supertest(app)
      .put(`/users/${a.body.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ email: "b@ex.com" })
      .expect(409);
  });

  test("DELETE /users/:id - somente admin", async () => {
    const tokenAdmin = await loginAsAdmin();

    // cria user
    const created = await supertest(app)
      .post("/users")
      .send({
        name: "Kill",
        email: "kill@ex.com",
        type: "user",
        password: "xxx",
      })
      .expect(201);

    // tenta deletar com o próprio usuário (não admin) -> 403
    const userLogin = await supertest(app)
      .post("/auth/login")
      .send({ email: "kill@ex.com", password: "xxx" })
      .expect(200);

    await supertest(app)
      .delete(`/users/${created.body.id}`)
      .set("Authorization", `Bearer ${userLogin.body.token}`)
      .expect(403);

    // admin deleta -> 204
    await supertest(app)
      .delete(`/users/${created.body.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(204);

    // confirmar que sumiu -> 404
    await supertest(app)
      .get(`/users/${created.body.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .expect(404);
  });
});
