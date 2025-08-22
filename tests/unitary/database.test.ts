import { resetDb, seedAdmin } from "../../src/database";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateUser,
} from "../../src/services";

describe("db (in-memory)", () => {
  beforeEach(async () => {
    await resetDb({ seed: true }); // sempre começa com admin
  });

  test("seedAdmin cria (ou não duplica) admin", async () => {
    const before = getAllUsers().length;
    await seedAdmin();
    const after = getAllUsers().length;
    expect(after).toBe(before); // não duplica
  });

  test("create/find/update/delete usuário", async () => {
    const user = await createUser({
      name: "João",
      email: "joao@ex.com",
      type: "user",
      password: "123456",
    });

    expect(findUserByEmail("joao@ex.com")?.id).toBe(user.id);
    expect(findUserById(user.id)?.email).toBe("joao@ex.com");

    const updated = await updateUser(user.id, {
      name: "João Silva",
      password: "nova123",
    });
    expect(updated?.name).toBe("João Silva");
    expect(updated?.updatedAt.getTime()).toBeGreaterThan(
      updated!.createdAt.getTime()
    );

    const ok = deleteUser(user.id);
    expect(ok).toBe(true);
    expect(findUserById(user.id)).toBeUndefined();
  });
});
