import type { NextFunction, Request, Response } from "express";
import { describe, expect, test, vi } from "vitest";
import { createCorsOptions } from "../src/config/security.js";
import { createRateLimiter } from "../src/middleware/rateLimiter.js";

const resolveCorsOrigin = (requestOrigin: string | undefined, origins?: string) => {
  const options = createCorsOptions({
    origins,
    nodeEnv: "production",
  });
  const originHandler = options.origin as (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) => void;

  return new Promise<boolean | undefined>((resolve, reject) => {
    originHandler(requestOrigin, (error, allow) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(allow);
    });
  });
};

const createLimiterRequest = () => {
  return {
    ip: "127.0.0.1",
    method: "GET",
    path: "/limited",
    headers: {},
    app: {
      get(name: string) {
        if (name === "trust proxy fn") {
          return () => false;
        }

        if (name === "trust proxy") {
          return false;
        }

        return undefined;
      },
    },
  } as Request;
};

const createLimiterResponse = () => {
  let statusCode = 200;
  let jsonBody: unknown;
  const finishListeners: Array<() => void> = [];
  const headers = new Map<string, string>();

  const res = {
    status(code: number) {
      statusCode = code;
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      jsonBody = body;
      (this as { writableEnded: boolean }).writableEnded = true;

      for (const listener of finishListeners) {
        listener();
      }

      return this;
    },
    setHeader(name: string, value: string) {
      headers.set(name.toLowerCase(), value);
      return this;
    },
    append(name: string, value: string) {
      const headerName = name.toLowerCase();
      const currentValue = headers.get(headerName);

      headers.set(headerName, currentValue ? `${currentValue}, ${value}` : value);
      return this;
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
    removeHeader(name: string) {
      headers.delete(name.toLowerCase());
      return this;
    },
    once(event: string, listener: () => void) {
      if (event === "finish") {
        finishListeners.push(listener);
      }

      return this;
    },
    statusCode,
    headersSent: false,
    writableEnded: false,
  } as Partial<Response> as Response;

  return {
    res,
    finish() {
      for (const listener of finishListeners) {
        listener();
      }
    },
    get statusCode() {
      return statusCode;
    },
    get jsonBody() {
      return jsonBody;
    },
  };
};

describe("createCorsOptions", () => {
  test("allows configured origins", async () => {
    await expect(
      resolveCorsOrigin("http://localhost:3000", "http://localhost:3000"),
    ).resolves.toBe(true);
  });

  test("blocks origins outside the allowlist", async () => {
    await expect(
      resolveCorsOrigin("https://evil.example.com", "http://localhost:3000"),
    ).resolves.toBe(false);
  });

  test("allows requests without an origin header", async () => {
    await expect(resolveCorsOrigin(undefined, "http://localhost:3000")).resolves.toBe(
      true,
    );
  });
});

describe("createRateLimiter", () => {
  test("returns 429 after exceeding the configured limit", async () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 2,
      message: "Too many requests for this test",
    });
    const next = vi.fn() as NextFunction;

    const first = createLimiterResponse();
    await limiter(createLimiterRequest(), first.res, next);

    const second = createLimiterResponse();
    await limiter(createLimiterRequest(), second.res, next);

    const third = createLimiterResponse();
    await limiter(createLimiterRequest(), third.res, next);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(third.statusCode).toBe(429);
    expect(third.jsonBody).toEqual({
      error: "Too many requests for this test",
    });
  });

  test("does not count successful responses when skipSuccessfulRequests is enabled", async () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 1,
      skipSuccessfulRequests: true,
      message: "Too many requests for this test",
    });
    const next = vi.fn() as NextFunction;

    const first = createLimiterResponse();
    await limiter(createLimiterRequest(), first.res, next);
    first.res.status(200).json({ ok: true });
    await Promise.resolve();

    const second = createLimiterResponse();
    await limiter(createLimiterRequest(), second.res, next);
    second.res.status(200).json({ ok: true });
    await Promise.resolve();

    const third = createLimiterResponse();
    await limiter(createLimiterRequest(), third.res, next);
    third.res.status(200).json({ ok: true });
    await Promise.resolve();

    expect(next).toHaveBeenCalledTimes(3);
    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(third.statusCode).toBe(200);
  });
});
