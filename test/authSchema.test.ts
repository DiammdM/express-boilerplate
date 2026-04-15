import { describe, expect, test } from "vitest";
import {
  loginParamReqSchema,
  registerParamReqSchema,
} from "../src/validators/authSchema.js";

describe("authSchema", () => {
  test("returns custom English messages for invalid login payloads", () => {
    const result = loginParamReqSchema.safeParse({
      email: "not-an-email",
      password: "",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.issues.map((issue) => issue.message)).toEqual([
      "Please enter a valid email address",
      "Password is required",
    ]);
  });

  test("returns custom English messages for invalid register payloads", () => {
    const result = registerParamReqSchema.safeParse({
      name: "   ",
      email: "",
      password: "",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.issues.map((issue) => issue.message)).toEqual([
      "Name is required",
      "Email is required",
      "Password is required",
    ]);
  });
});
