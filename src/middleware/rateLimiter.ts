import rateLimit from "express-rate-limit";

type CreateRateLimiterOptions = {
  windowMs: number;
  max: number;
  skipSuccessfulRequests?: boolean;
  message: string;
};

const createRateLimiter = ({
  windowMs,
  max,
  skipSuccessfulRequests = false,
  message,
}: CreateRateLimiterOptions) => {
  return rateLimit({
    windowMs,
    max,
    skipSuccessfulRequests,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: message,
      });
    },
  });
};

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again later",
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many registration attempts, please try again later",
});

export { apiLimiter, createRateLimiter, loginLimiter, registerLimiter };
