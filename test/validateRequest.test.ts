import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { describe, expect, test, vi } from "vitest";
import { validateParamsBody } from "../src/middleware/validteRequest.js";

const createResponse = () => {
  let statusCode: number | undefined;
  let jsonBody: unknown;

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      jsonBody = body;
      return this;
    },
  } as Partial<Response> as Response;

  return {
    res,
    get statusCode() {
      return statusCode;
    },
    get jsonBody() {
      return jsonBody;
    },
  };
};

describe("validateParamsBody", () => {
  test("passes parsed body to the next middleware when validation succeeds", () => {
    const schema = z.object({
      email: z.string().trim().email(),
      password: z.string().min(1),
    });
    const req = {
      body: {
        email: "  alice@example.com  ",
        password: "secret",
      },
    } as Request;
    const response = createResponse();
    const next = vi.fn() as NextFunction;

    validateParamsBody(schema)(req, response.res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({
      email: "alice@example.com",
      password: "secret",
    });
    expect(response.statusCode).toBeUndefined();
    expect(response.jsonBody).toBeUndefined();
  });

  test("returns readable validation errors when body validation fails", () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });
    const req = {
      body: {
        email: "not-an-email",
        password: "123",
      },
    } as Request;
    const response = createResponse();
    const next = vi.fn() as NextFunction;

    validateParamsBody(schema)(req, response.res, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(response.jsonBody).toEqual({
      message:
        "email: Invalid email address; password: Too small: expected string to have >=8 characters",
      errors: [
        "email: Invalid email address",
        "password: Too small: expected string to have >=8 characters",
      ],
    });
  });
});
