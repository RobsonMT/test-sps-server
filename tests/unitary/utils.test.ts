import { User } from "../../src/types";
import { isEmail, sanitizeUser } from "../../src/utils";

describe("utils", () => {
  test("isEmail valida formatos básicos", () => {
    expect(isEmail("a@b.com")).toBe(true);
    expect(isEmail("user.name+tag@domain.co")).toBe(true);
    expect(isEmail("invalid-email")).toBe(false);
    expect(isEmail("x@y")).toBe(false);
    expect(isEmail("x@.com")).toBe(false);
  });

  test("sanitizeUser remove passwordHash", () => {
    const u: User = {
      id: "1",
      name: "X",
      email: "x@y.com",
      type: "user",
      passwordHash: "hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const safe = sanitizeUser(u) as any;
    expect(safe.passwordHash).toBeUndefined();
    expect(safe.email).toBe("x@y.com");
  });
});
