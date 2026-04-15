import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { afterEach, expect, test, vi } from "vitest";

process.env.JWT_SECRET ??= "test-jwt-secret";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:5432/express_test";

const [{ authMiddleware }, { generateToken }, { prisma }] = await Promise.all([
  import("../src/middleware/authentication.js"),
  import("../src/utils/auth.js"),
  import("../src/lib/prisma.js"),
]);

afterEach(() => {
  vi.restoreAllMocks();
});

const createRequest = ({
  path,
  authorization,
  method = "GET",
}: {
  path: string;
  authorization?: string;
  method?: string;
}) => {
  return {
    path,
    method,
    headers: authorization ? { authorization } : {},
  } as Request;
};

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

test("rejects requests when the bearer token is missing", async () => {
  const req = createRequest({ path: "/user/1" });
  const response = createResponse();
  let nextCalled = false;

  await authMiddleware(req, response.res, (() => {
    nextCalled = true;
  }) as NextFunction);

  expect(nextCalled).toBe(false);
  expect(response.statusCode).toBe(401);
  expect(response.jsonBody).toEqual({
    error: "Not authorized, token is missing or invalid",
  });
});

test("rejects protected routes when the token is invalid", async () => {
  const req = createRequest({
    path: "/user/1",
    authorization: "Bearer invalid-token",
  });
  const response = createResponse();
  let nextCalled = false;

  await authMiddleware(req, response.res, (() => {
    nextCalled = true;
  }) as NextFunction);

  expect(nextCalled).toBe(false);
  expect(response.statusCode).toBe(401);
  expect(response.jsonBody).toEqual({
    error: "Not authorized, token is invalid",
  });
});

test("rejects protected routes when the token is expired", async () => {
  const expiredToken = jwt.sign(
    { userId: 42 },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "-1s",
    },
  );
  const req = createRequest({
    path: "/user/42",
    authorization: `Bearer ${expiredToken}`,
  });
  const response = createResponse();
  let nextCalled = false;

  await authMiddleware(req, response.res, (() => {
    nextCalled = true;
  }) as NextFunction);

  expect(nextCalled).toBe(false);
  expect(response.statusCode).toBe(401);
  expect(response.jsonBody).toEqual({
    error: "Not authorized, token has expired",
  });
});

test("allows protected routes when the token is valid and the user exists", async () => {
  const token = generateToken(42);
  const req = createRequest({
    path: "/user/42",
    authorization: `Bearer ${token}`,
  });
  const response = createResponse();
  let nextCalled = false;
  const findUniqueSpy = vi.spyOn(prisma.user, "findUnique").mockResolvedValue({
    id: 42,
    name: "alice",
    email: "alice@example.com",
  } as Awaited<ReturnType<typeof prisma.user.findUnique>>);

  await authMiddleware(req, response.res, (() => {
    nextCalled = true;
  }) as NextFunction);

  expect(findUniqueSpy).toHaveBeenCalledTimes(1);
  expect(findUniqueSpy).toHaveBeenCalledWith({
    where: { id: 42 },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  expect(nextCalled).toBe(true);
  expect(response.statusCode).toBeUndefined();
  expect(req.user).toEqual({
    id: 42,
    name: "alice",
    email: "alice@example.com",
  });
});

test("rejects protected routes when the token is valid but the user no longer exists", async () => {
  const token = generateToken(999);
  const req = createRequest({
    path: "/user/999",
    authorization: `Bearer ${token}`,
  });
  const response = createResponse();
  let nextCalled = false;

  vi.spyOn(prisma.user, "findUnique").mockResolvedValue(
    null as Awaited<ReturnType<typeof prisma.user.findUnique>>,
  );

  await authMiddleware(req, response.res, (() => {
    nextCalled = true;
  }) as NextFunction);

  expect(nextCalled).toBe(false);
  expect(response.statusCode).toBe(401);
  expect(response.jsonBody).toEqual({
    error: "User no longer exists",
  });
});
