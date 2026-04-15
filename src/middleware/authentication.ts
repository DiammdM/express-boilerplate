import { type NextFunction, type Request, type Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../utils/auth.js";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Not authorized, token is missing or invalid",
      });
      return;
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      res.status(401).json({
        error: "User no longer exists",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        error: "Not authorized, token has expired",
      });
      return;
    }

    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        error: "Not authorized, token is invalid",
      });
      return;
    }

    res.status(401).json({
      error: "Not authorized",
    });
  }
};

export { authMiddleware };
